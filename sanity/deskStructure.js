import S from "@sanity/desk-tool/structure-builder"
import { AiOutlineHome } from 'react-icons/ai'
import { GoLightBulb } from 'react-icons/go'

export default () => 
    S.list()
        .title('Innhold')
        .items(
            [
                ...S.documentTypeListItems()
                .filter(item => !['landingPage', 'loggedInPage'].includes(item.getId())),
                S.divider(),
                S.listItem()
                    .title('Landingsside')
                    .icon(AiOutlineHome)
                    .child(
                        S.document()
                            .schemaType('landingPage')
                            .documentId('landingPage')
                    ),
                S.listItem()
                    .title('Hjelp for innloggede')
                    .icon(GoLightBulb)
                    .child(
                        S.document()
                            .schemaType('loggedInPage')
                            .documentId('loggedInPage')
                    ),
            ]
        )