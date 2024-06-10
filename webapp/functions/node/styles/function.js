const functions = require('firebase-functions');
const mailjet = require('node-mailjet')
const mjml2html = require('mjml')
const mjml2json = require('mjml2json').default
const json2mjml = require('json2mjml').default
var admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCLOUD_PROJECT,
});

const {
    Firestore
} = require('@google-cloud/firestore');
const {
    SecretManagerServiceClient
} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();
const db = new Firestore();

async function accessSecretVersion(name) {
    const [version] = await client.accessSecretVersion({
        name: name,
    })
    return version.payload.data.toString('utf8')
}

/* validates given JWT, returns void if not valid */
const validateToken = async (token) => 
    admin
        .auth()
        .verifyIdToken(token)
        .then(decodedToken => decodedToken)
        .catch(error => functions.logger.error(error));

const processMJMLContent = (mjmlContent, style) => {
    const output = mjml2json(mjmlContent)
    const mjHead = output.children
        .filter(obj => obj.tagName === 'mj-head')[0]

    mjHead.children
        .filter(obj => obj.tagName === 'mj-attributes')[0]
        .children.forEach(element => {
            element.attributes["font-family"] = `${style.font} !important`
            if (element.attributes.name === "primaryStyle") {
                element.attributes.color = `${style.primaryColor} !important`
            }
            if (element.attributes.name !== "secondaryStyle") {
                element.attributes["background-color"] = `${style.secondaryColor} !important`
            }
        })

    mjHead.children
        .filter(obj => obj.tagName === 'mj-style')[0]
        .content = `a {color: ${style.primaryColor} !important}`

    const footer = output.children
        .filter(obj => obj.tagName === 'mj-body')[0]
        .children
        .filter(obj => obj.tagName === 'mj-section' && obj.attributes['css-class'] === 'footerText')[0]
        .children[0]
        .children[0]

    var content = footer.content
    content = content.replace(/[\r\n|\n]/g, '')
    const newVal = /<p[\s\S]+?>([\s\S]*?)<\/p>/gm.exec(content)
    const stringToReplace = newVal ? newVal[1] : content
    content = content.replace(stringToReplace, style.footer)
    content = content.replace(/  +/g, ' ')
    footer.content = content
    return output
}

const getMailjetTemplate = async(mailjetClient, id) => {
    return await mailjetClient
        .get("template")
        .id(id)
        .action("detailcontent")
        .request()
}

const createMailjetTemplate = async(mailjetClient, name) => {
    return await mailjetClient.post("template")
        .request({
            "Name": name,
            "Purposes": ["transactional"],
            "EditMode": 4
        })
}

const updateMailjetTemplate = async(mailjetClient, id, headers, output) => {
    const mjmlContent = json2mjml(output)
    return await mailjetClient
        .post("template")
        .id(id)
        .action('detailcontent')
        .request({
            "Headers": headers,
            "MJMLContent": mjmlContent,
            "Html-part": mjml2html(mjmlContent).html
        })
}

const deleteMailjetTemplate = async(mailjetClient, id) => {
    return await mailjetClient
        .delete("template")
        .id(id)
        .request()
}

const getMailjetClient = async(orgId) => {
    const apiKey = await accessSecretVersion(`projects/${process.env.GCLOUD_PROJECT}/secrets/${orgId}_mailjet_key/versions/latest`)
    const secret = await accessSecretVersion(`projects/${process.env.GCLOUD_PROJECT}/secrets/${orgId}_mailjet_secret/versions/latest`)
    return mailjet.connect(apiKey, secret)
}

const getTemplateApplicationSnapshots = async(context) => {
    const templateApplicationList = []
    const templateApplication = await db
        .collection('organization')
        .doc(context.params.orgId)
        .collection('template_application')
        .get()

    templateApplication.forEach(obj => templateApplicationList.push(obj))
    return templateApplicationList
}

async function processStyle(snap, context, before=undefined) {
    try {
        const style = snap.data()
        const mailjetClient = await getMailjetClient(context.params.orgId)
        const templateApplicationList = await getTemplateApplicationSnapshots(context)

        for (const templateApplicationSnapshot of templateApplicationList) {
            const defaultTemplateApplication = await templateApplicationSnapshot.ref
                .collection('mailjet_template_ids')
                .doc('default')
                .get()

            const defaultMailjetTemplate = await getMailjetTemplate(mailjetClient,
                defaultTemplateApplication.data().id)

            const newMjmlContent = processMJMLContent(defaultMailjetTemplate.body.Data[0].MJMLContent, style)

            let mailjetTemplateId = undefined
            if (before) {
                mailjetTemplateIdSnapshot = await templateApplicationSnapshot
                    .ref
                    .collection('mailjet_template_ids')
                    .doc(before.data().name)
                    .get()
                mailjetTemplateId = mailjetTemplateIdSnapshot
                    .data()
                    .id
            }
            else {
                mailjetTemplate = await createMailjetTemplate(mailjetClient,
                                                              `${templateApplicationSnapshot.id}-${style.name}`)
                mailjetTemplateId = mailjetTemplate.body.Data[0].ID
            }

            const updatedMailjetTemplate = await updateMailjetTemplate(mailjetClient,
                mailjetTemplateId,
                defaultMailjetTemplate.body.Data[0].Headers,
                newMjmlContent)

            await templateApplicationSnapshot.ref.collection('mailjet_template_ids').doc(style.name).set({
                'active': true,
                'id': mailjetTemplateId
            })
            if (before && before.data().name !== style.name){
                templateApplicationSnapshot.ref.collection('mailjet_template_ids').doc(before.data().name).delete()
            }
        }
        await snap.ref.set({
            status: "done",
            lastChangedBy: "server"
        }, {
            merge: true
        })
    } catch (e) {
        await snap.ref.set({
            status: "error",
            lastChangedBy: "server"
        }, {
            merge: true
        })
        functions.logger.error(context, e)
    }
}


async function deleteStyle(snap, context) {
    try {
        const style = snap.data()
        functions.logger.info(`Initializing delete of style [style.name]`)
        const mailjetClient = await getMailjetClient(context.params.orgId)
        const templateApplicationList = await getTemplateApplicationSnapshots(context)
        functions.logger.info('Fetched template_applications:', templateApplicationList.map((template) => template.id))

        for (const templateApplicationSnapshot of templateApplicationList) {
            functions.logger.info(`Processing delete on [${templateApplicationSnapshot.id}], path is: [${templateApplicationSnapshot.ref.path}]`)
            
            const mailjetTemplateIdSnapshot = await templateApplicationSnapshot
                .ref
                .collection('mailjet_template_ids')
                .doc(style.name)
                .get()

            const mailjetTemplateIdData = mailjetTemplateIdSnapshot.data()

            functions.logger.info(`Current mailjet_template_id on path [${mailjetTemplateIdSnapshot.ref.path}] is:`, mailjetTemplateIdData )

            if(mailjetTemplateIdData) {
                const { response } = await deleteMailjetTemplate(mailjetClient, mailjetTemplateIdData.id)
                    .catch((error) => {
                        functions.logger.warn(`Received an errounous response from mailjet: [${error.message}]`)
                        functions.logger.warn(`Verify in mailjet that template with id [${mailjetTemplateIdData.id}] has been deleted.`)
                        return error
                    })
                
                if (response.statusCode === 204 || response.statusCode === 404) {
                    mailjetTemplateIdSnapshot.ref.delete()
                }
                else {
                    functions.logger.warn(`Unable to delete [${templateApplicationSnapshot.id}], skipping`)
                }
                
            }
        }
    } catch(e) {
        const snapData = snap.data()
        snapData.status = "error"
        snapData.lastChangedBy = "server"
        functions.logger.warn('Caught error, rolling back with snapshot', snapData)
        await db
            .collection('organization')
            .doc(context.params.orgId)
            .collection('styles')
            .doc(context.params.styleId).set(snapData)
        functions.logger.error(context, e)
    }
}

/* returns the orgId of the given user */
const getOrgFromUser = async (userId) => {
    const userDoc = await db.collection('users').doc(userId).get();
  
    if (userDoc.exists) {
      return userDoc.data().orgId;
    }
  };
  exports.mailTemplateContent = async (req, res) => {
    /* set standard res headers */
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');
  
    /* handle preflight */
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Authorization');
      res.set('Access-Control-Max-Age', '3600');
      return res.status(204).send('');
    }
  
    /* validate request */
    const verifiedToken = await validateToken(req.get('Authorization').replace('Bearer ', ''));
    const templateId = req.query.templateId;
    functions.logger.info('Fetching mail template with id: ' + templateId);
  
    if (!verifiedToken) return res.status(401).send('');
    if (!templateId) return res.status(400).send('');
  
    /* extract user and org IDs to create MJ client */
    const userId = verifiedToken.user_id;
    const orgId = await getOrgFromUser(userId);
    const mailjetClient = await getMailjetClient(orgId);
  
    /* fetch and parse MJ template (can be either mjml or json...) */
    const mailjetResponse = await getMailjetTemplate(mailjetClient, templateId);
    const data = mailjetResponse.body['Data'][0];
    const mjml = typeof data.MJMLContent === 'object' ? data['MJMLContent'] : mjml2json(data['MJMLContent']);
    const html = data['Html-part'];
  
    res.status(200).send({ templateId, content: { html, mjml }, msg: 'success' });
  };
  


exports.firestoreCreateStyle = functions.firestore
    .document('organization/{orgId}/styles/{styleId}')
    .onCreate((snap, context) => {
        if(snap.data().lastChangedBy != "server"){
            return processStyle(snap, context)
        }
    return 200
})


exports.firestoreUpdateStyle = functions.firestore
    .document('organization/{orgId}/styles/{styleId}')
    .onUpdate((change, context) => {
        if(change.after.data().lastChangedBy != "server"){
            return processStyle(change.after, context, update=change.before)
        }
        return 200
    });


exports.firestoreDeleteStyle = functions.firestore
    .document('organization/{orgId}/styles/{styleId}')
    .onDelete((snap, context) => {
        return deleteStyle(snap, context)
    });
