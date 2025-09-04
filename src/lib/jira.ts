interface JiraComment {
  body: {
    type: string;
    version: number;
    content: Array<{
      type: string;
      content: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

export async function addCommentToJiraTask(taskKey: string, comment: string): Promise<boolean> {
  try {
    const jiraBaseUrl = process.env.JIRA_BASE_URL;
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraApiToken = process.env.JIRA_API_TOKEN;

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      console.error('Missing Jira configuration in environment variables');
      return false;
    }

    if (!taskKey) {
      console.error('No Jira task key provided');
      return false;
    }

    // Crear el comentario en formato Atlassian Document Format (ADF)
    const commentBody: JiraComment = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: comment
              }
            ]
          }
        ]
      }
    };

    // Crear las credenciales de autenticación
    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

    // Hacer la petición a la API de Jira
    const response = await fetch(`${jiraBaseUrl}/rest/api/3/issue/${taskKey}/comment`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to add comment to Jira task ${taskKey}:`, response.status, errorText);
      return false;
    }

    console.log(`Successfully added comment to Jira task ${taskKey}`);
    return true;

  } catch (error) {
    console.error('Error adding comment to Jira task:', error);
    return false;
  }
}

export async function validateJiraTaskExists(taskKey: string): Promise<boolean> {
  try {
    const jiraBaseUrl = process.env.JIRA_BASE_URL;
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraApiToken = process.env.JIRA_API_TOKEN;

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken || !taskKey) {
      return false;
    }

    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

    const response = await fetch(`${jiraBaseUrl}/rest/api/3/issue/${taskKey}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    return response.ok;

  } catch (error) {
    console.error('Error validating Jira task:', error);
    return false;
  }
}