## Firestore create style

Process new documents in firestore `organization/{org_id}/styles/{style_id}`.
Create and update mailjet templates for each existing template_application.

## Firestore update style

Process updates to documents in firestore `organization/{org_id}/styles/{style_id}`.
Update every mailjet template with styleId.

## Firestore delete style

Process deleted documents in firestore `organization/{org_id}/styles/{style_id}`.
Delete mailjet templates with styleId.

# Mail template content

Receives a mailjet template id to return the `detailedContent` of the found template.
