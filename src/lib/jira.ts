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

    if (!taskKey || !comment) {
      console.error('No Jira task key or comment provided');
      return false;
    }

    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

    const jiraComment: JiraComment = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: comment,
              },
            ],
          },
        ],
      },
    };

    const response = await fetch(`${jiraBaseUrl}/rest/api/3/issue/${taskKey}/comment`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jiraComment)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to add comment to Jira task: ${response.status} ${response.statusText}`, errorText);
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

    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

    const response = await fetch(`${jiraBaseUrl}/rest/api/3/issue/${taskKey}/transitions`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch Jira task transitions: ${response.status} ${response.statusText}`, errorText);
      return [];
    }

    const data = await response.json();
    return data.transitions || [];
  } catch (error) {
    console.error('Error fetching Jira task transitions:', error);
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

    // Normalizador y helpers locales
    const normalize = (s: string) => s.trim().toLowerCase();
    const toName = (t: any) => normalize(t.to?.name || '');
    const statusLower = normalize(statusName);
    const transName = (t: any) => (t?.name ? normalize(String(t.name)) : '');
    
    // Buscar la transición que corresponde al estado deseado
    let targetTransition;
    
    if (statusLower === 'approved') {
      // Estados/variaciones típicos (inglés y español) para "Aprobado"
      const approvedExactTargets = [
        'approved', 'aprobado', 'aprobada',
        'done', 'resolved', 'closed', 'complete', 'completed', 'finished',
        'resuelto', 'resuelta', 'cerrado', 'cerrada', 'hecho', 'terminado', 'finalizado', 'finalizada', 'completado', 'completada', 'listo'
      ];

      // 1) Match exacto por nombre del estado destino (to.name)
      targetTransition = transitions.find(t => approvedExactTargets.includes(toName(t)));

      // 2) Si no hay exacto, buscar por tokens en to.name o en el nombre de transición
      if (!targetTransition) {
        const approvedTokens = [
          'approved', 'approve', 'aprob', // cubrir "approve", "aprobar", "aprobación"
          'done', 'resolved', 'closed', 'complete', 'finished',
          'resuelt', 'cerrad', 'hech', 'termin', 'finaliz', 'complet', 'list'
        ];
        targetTransition = transitions.find(t => {
          const tn = toName(t);
          const trn = transName(t);
          return approvedTokens.some(tok => tn.includes(tok) || trn.includes(tok));
        });
      }

      if (targetTransition) {
        console.log(`Found transition for 'Approved': ${transitionName(targetTransition)} -> ${toName(targetTransition)}`);
      }
    } else if (
      statusLower === 'waiting for approval' ||
      statusLower === 'waiting approval' ||
      statusLower === 'waiting for approved' ||
      statusLower === 'waiting approved'
    ) {
      // Mapear específicamente a estados de "espera de aprobación" evitando saltar a 'Approved'
      const exactApprovalTargets = [
        'waiting for approval',
        'awaiting approval',
        'pending approval',
        'approval pending',
        'in approval',
        'under approval',
        'in review',
        'under review',
        'awaiting review'
      ];

      targetTransition = transitions.find(t => exactApprovalTargets.includes(toName(t)));

      if (!targetTransition) {
        // Búsqueda por includes en el nombre del estado destino (NO usar el nombre de la transición)
        const approvalTokens = ['waiting for approval', 'awaiting approval', 'pending approval', 'approval', 'review', 'awaiting', 'pending'];
        const excludeApprovedTokens = ['approved', 'approve'];
        targetTransition = transitions.find(t => {
          const tn = toName(t);
          return approvalTokens.some(tok => tn.includes(tok)) && !excludeApprovedTokens.some(ex => tn.includes(ex));
        });
      }

      if (targetTransition) {
        console.log(`Found transition for '${statusName}': ${transitionName(targetTransition)} -> ${toName(targetTransition)}`);
      }
    } else if (
      statusLower === 'waiting for integration' ||
      statusLower === 'waiting integration'
    ) {
      // Mapear específicamente a estados de "espera de integración"
      const exactIntegrationTargets = [
        'waiting for integration',
        'awaiting integration',
        'pending integration',
        'integration pending',
        'ready for integration',
        'ready to integrate',
        'ready for merge',
        'ready to merge',
        'merge ready'
      ];

      targetTransition = transitions.find(t => exactIntegrationTargets.includes(toName(t)));

      if (!targetTransition) {
        const integrationTokens = ['waiting for integration', 'awaiting integration', 'pending integration', 'integration', 'integrat', 'merge'];
        targetTransition = transitions.find(t => integrationTokens.some(tok => toName(t).includes(tok)));
      }

      if (targetTransition) {
        console.log(`Found transition for '${statusName}': ${transitionName(targetTransition)} -> ${toName(targetTransition)}`);
      }
    } else if (statusLower === 'declined' || statusLower === 'rejected' || statusLower === 'refused') {
      // Estados/variaciones típicos (inglés y español) para "Rechazado"
      const declinedExactTargets = [
        'declined', 'rejected', 'refused',
        'rechazado', 'rechazada',
        'cancelled', 'canceled', 'cancelado', 'cancelada',
        "won't do", 'wont do', "won't fix", 'wont fix',
        'not done', 'no hecho',
        'closed', 'cerrado', 'cerrada'
      ];

      // 1) Match exacto por estado destino
      targetTransition = transitions.find(t => declinedExactTargets.includes(toName(t)));

      // 2) Si no hay exacto, usar tokens en to.name o transition.name
      if (!targetTransition) {
        const declinedTokens = [
          'declin', 'reject', 'refus',
          'rechaz', 'deneg', // rechazar, denegar
          'cancel', 'cancelar', 'cancela',
          "won't do", 'wont do', "won't fix", 'wont fix',
          'not done', 'no hecho',
          'close', 'cerrar', 'cerrad'
        ];
        targetTransition = transitions.find(t => {
          const tn = toName(t);
          const trn = transName(t);
          return declinedTokens.some(tok => tn.includes(tok) || trn.includes(tok));
        });
      }

      if (targetTransition) {
        console.log(`Found transition for 'Declined': ${transitionName(targetTransition)} -> ${toName(targetTransition)}`);
      }
    } else {
      targetTransition = transitions.find(transition => 
        toName(transition) === statusLower
      );
    }

    if (!targetTransition) {
      console.error(`No transition found for status '${statusName}' in task ${taskKey}`);
      console.log('Available transitions:', transitions.map(t => `${t.id}: ${transitionName(t)} -> ${toName(t)}`));
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

function transitionName(t: any): string {
  return (t?.name ? String(t.name) : '').trim();
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

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return Boolean(data && data.key);
  } catch (error) {
    return false;
  }
}