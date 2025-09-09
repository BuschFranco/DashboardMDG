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

export async function getJiraTaskTransitions(taskKey: string): Promise<any[]> {
  try {
    const jiraBaseUrl = process.env.JIRA_BASE_URL;
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraApiToken = process.env.JIRA_API_TOKEN;

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      console.error('Missing Jira configuration in environment variables');
      return [];
    }

    if (!taskKey) {
      console.error('No Jira task key provided');
      return [];
    }

    // Crear las credenciales de autenticación
    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

    const url = `${jiraBaseUrl}/rest/api/3/issue/${taskKey}/transitions`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get Jira task transitions: ${response.status} ${response.statusText}`, errorText);
      return [];
    }

    const data = await response.json();
    console.log(`Available transitions for ${taskKey}:`, data.transitions);
    return data.transitions || [];

  } catch (error) {
    console.error('Error getting Jira task transitions:', error);
    return [];
  }
}

export async function updateJiraTaskStatus(taskKey: string, statusName: string): Promise<boolean> {
  try {
    const jiraBaseUrl = process.env.JIRA_BASE_URL;
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraApiToken = process.env.JIRA_API_TOKEN;

    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      console.error('Missing Jira configuration in environment variables');
      return false;
    }

    if (!taskKey || !statusName) {
      console.error('No Jira task key or status name provided');
      return false;
    }

    // Primero obtener las transiciones disponibles
    const transitions = await getJiraTaskTransitions(taskKey);
    
    // Buscar la transición que corresponde al estado deseado
    // Para 'Approved', intentar múltiples variaciones comunes
    let targetTransition;
    
    if (statusName.toLowerCase() === 'approved') {
      // Buscar variaciones comunes del estado 'Approved'
      const approvedVariations = ['approved', 'done', 'resolved', 'closed', 'complete', 'finished'];
      
      for (const variation of approvedVariations) {
        targetTransition = transitions.find(transition => 
          transition.to.name.toLowerCase().includes(variation) ||
          transition.name.toLowerCase().includes(variation)
        );
        if (targetTransition) {
          console.log(`Found transition for 'Approved': ${targetTransition.name} -> ${targetTransition.to.name}`);
          break;
        }
      }
    } else {
      targetTransition = transitions.find(transition => 
        transition.to.name.toLowerCase() === statusName.toLowerCase()
      );
    }

    if (!targetTransition) {
      console.error(`No transition found for status '${statusName}' in task ${taskKey}`);
      console.log('Available transitions:', transitions.map(t => `${t.id}: ${t.name} -> ${t.to.name}`));
      return false;
    }

    // Crear las credenciales de autenticación
    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

    const url = `${jiraBaseUrl}/rest/api/3/issue/${taskKey}/transitions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transition: {
          id: targetTransition.id
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to update Jira task status: ${response.status} ${response.statusText}`, errorText);
      return false;
    }

    console.log(`Successfully updated Jira task ${taskKey} status to ${statusName} (transition ID: ${targetTransition.id})`);
    return true;

  } catch (error) {
    console.error('Error updating Jira task status:', error);
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