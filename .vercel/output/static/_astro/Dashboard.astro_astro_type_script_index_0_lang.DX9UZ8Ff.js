let a=1,u={search:"",country:"",product:"",adminApproval:""};const g=document.getElementById("loading"),L=document.getElementById("error"),A=document.getElementById("tableBody"),m=document.getElementById("pagination"),M=document.getElementById("paginationInfo"),I=document.getElementById("pageNumbers"),y=document.getElementById("prevPage"),v=document.getElementById("nextPage"),P=document.getElementById("retryBtn"),f=document.getElementById("search"),h=document.getElementById("country"),E=document.getElementById("product"),$=document.getElementById("adminApproval"),w=document.getElementById("applyFilters"),B=document.getElementById("clearFilters");async function d(t=1){try{F();const e=new URLSearchParams({page:t.toString(),limit:"10",...u}),n=await(await fetch(`/api/requests?${e}`)).json();n.success?(j(n.data),N(n.pagination),R()):k()}catch(e){console.error("Error fetching requests:",e),k()}}function j(t){if(t.length===0){A.innerHTML=`
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            No se encontraron solicitudes
          </td>
        </tr>
      `;return}A.innerHTML=t.map(e=>{const o=new Date(e.createdAt).toLocaleDateString("es-ES",{year:"numeric",month:"2-digit",day:"2-digit"});return C(e.adminApproval),`
        <tr>
          <td><span class="dev-id">${e.devId}</span></td>
          <td>${o}</td>
          <td>${e.requesterName}</td>
          <td>${e.country}</td>
          <td>${e.product}</td>
          <td>${e.planType}</td>
          <td>
            <!-- Versión estática (por defecto) -->
            <span class="static-approval status-badge status-${(e.adminApproval||"Pendiente").toLowerCase().replace(" ","-")}" style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; ${z(e.adminApproval||"Pendiente")}">${e.adminApproval||"Pendiente"}</span>
                        <!-- Versión dropdown (solo visible en modo Admin) -->
                        <select class="admin-approval-select" data-request-id="${e._id}" data-current-status="${e.adminApproval||"Pendiente"}" style="display: none;">
                            <option value="Pendiente" ${(e.adminApproval||"Pendiente")==="Pendiente"?"selected":""}>Pendiente</option>
                            <option value="Aprobado" ${e.adminApproval==="Aprobado"?"selected":""}>Aprobado</option>
                            <option value="Rechazado" ${e.adminApproval==="Rechazado"?"selected":""}>Rechazado</option>
            </select>
          </td>
          <td>
            ${e.jiraTaskUrl?`<a href="${e.jiraTaskUrl}" target="_blank" class="jira-link">Ver Task</a>`:'<span style="color: var(--text-secondary);">N/A</span>'}
          </td>
        </tr>
      `}).join("")}function C(t){const e=t.toLowerCase();return e.includes("aprobado")||e.includes("approved")?"status-approved":e.includes("rechazado")||e.includes("rejected")?"status-rejected":"status-pending"}function z(t){const e=t.toLowerCase();return e.includes("aprobado")||e.includes("approved")?"background-color: #dcfce7; color: #166534;":e.includes("rechazado")||e.includes("rejected")?"background-color: #fef2f2; color: #dc2626;":"background-color: #fef3c7; color: #d97706;"}function N(t){const{page:e,total:o,totalPages:n}=t;M.textContent=`Mostrando ${(e-1)*10+1}-${Math.min(e*10,o)} de ${o} resultados`,y.disabled=e<=1,v.disabled=e>=n;const c=[],r=5;let s=Math.max(1,e-Math.floor(r/2)),l=Math.min(n,s+r-1);l-s+1<r&&(s=Math.max(1,l-r+1));for(let i=s;i<=l;i++)c.push(`
        <button class="page-btn ${i===e?"active":""}" data-page="${i}">
          ${i}
        </button>
      `);I.innerHTML=c.join(""),I.querySelectorAll(".page-btn").forEach(i=>{i.addEventListener("click",T=>{const x=T.target,b=parseInt(x.dataset.page);a=b,d(b)})}),m.style.display="flex"}function F(){g.style.display="block",L.style.display="none",m.style.display="none"}function R(){g.style.display="none"}function k(){g.style.display="none",L.style.display="block",m.style.display="none"}function p(){u={search:f.value.trim(),country:h.value.trim(),product:E.value.trim(),adminApproval:$.value},a=1,d(1)}function S(){f.value="",h.value="",E.value="",$.value="",u={search:"",country:"",product:"",adminApproval:""},a=1,d(1)}async function U(t){console.log("handleApprovalChange called:",{element:t,requestId:t.dataset.requestId,currentStatus:t.dataset.currentStatus,newValue:t.value,adminToken:window.adminToken});const e=t.dataset.requestId,o=t.dataset.currentStatus,n=t.value;if(n===o){console.log("No change detected, returning");return}if(!confirm(`¿Estás seguro de cambiar el estado de "${o}" a "${n}"?`)){t.value=o;return}try{t.disabled=!0,t.style.opacity="0.6",console.log("Sending API request with data:",{token:window.adminToken,requestId:e,newStatus:n});const r=await fetch("/api/update-approval",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId:e,newStatus:n,token:window.adminToken})});console.log("API response status:",r.status);const s=await r.json();console.log("API response data:",s),s.success?(console.log("Update successful, updating UI"),t.dataset.currentStatus=n,alert(`Estado actualizado exitosamente a: ${n}`),d(a)):(console.error("API error:",s),alert(`Error: ${s.error}`),t.value=o)}catch(r){console.error("Error in handleApprovalChange:",r),alert("Error al actualizar el estado. Por favor, intenta de nuevo."),t.value=o}finally{t.disabled=!1,t.style.opacity="1"}}w.addEventListener("click",p);B.addEventListener("click",S);P.addEventListener("click",()=>d(a));y.addEventListener("click",()=>{a>1&&(a--,d(a))});v.addEventListener("click",()=>{a++,d(a)});document.addEventListener("DOMContentLoaded",()=>{console.log("DOM loaded, setting up event listeners"),w.addEventListener("click",p),B.addEventListener("click",S),P.addEventListener("click",()=>d(a)),y.addEventListener("click",()=>{a>1&&(a--,d(a))}),v.addEventListener("click",()=>{a++,d(a)}),[f,h,E].forEach(t=>{t.addEventListener("keypress",e=>{e.key==="Enter"&&p()})}),d(1),setTimeout(()=>{V()},500)});function V(){if(window.location.pathname.includes("/admin/")){const e=document.querySelectorAll(".static-approval"),o=document.querySelectorAll(".admin-approval-select");e.forEach(n=>{n.style.display="none"}),o.forEach(n=>{n.style.display="block"}),o.forEach((n,c)=>{n.addEventListener("change",r=>{U(r.target)})})}}
