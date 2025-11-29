
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("driver-form");
  const resetBtn = document.getElementById("reset-btn");
  const saveBtn = document.getElementById("save-btn");
  const toggleViewBtn = document.getElementById("toggle-view");
  const listContainer = document.getElementById("list-container");
  const searchInput = document.getElementById("search");

  let currentView = "drivers"; 

  function fetchDriversAndRender() {
    fetch("/api/drivers").then(r => r.json()).then(renderDriversTable);
  }
  function fetchTeamsAndRender() {
    fetch("/api/teams").then(r => r.json()).then(renderTeamsTable);
  }

  function renderDriversTable(drivers) {
    currentView = "drivers";
    toggleViewBtn.textContent = "Show: Drivers";
    const rows = drivers.map(d => {
      const teamName = d.team ? d.team.name : "";
      return `<tr data-id="${d._id}">
        <td class="num">${d.num || ""}</td>
        <td class="code">${d.code || ""}</td>
        <td class="name">${(d.forename||"") + " " + (d.surname||"")}</td>
        <td class="nat">${d.nationality || ""}</td>
        <td class="team">${teamName}</td>
        <td class="actions">
          <button class="edit-btn">Edit</button>
          <button class="inline-edit-btn">Inline Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      </tr>`;
    }).join("");
    listContainer.innerHTML = `<table id="drivers-table" class="data-table">
      <thead><tr><th>#</th><th>Code</th><th>Name</th><th>Nationality</th><th>Team</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody></table>`;
  }

  function renderTeamsTable(teams) {
    currentView = "teams";
    toggleViewBtn.textContent = "Show: Teams";
    const rows = teams.map(t => `<tr data-id="${t._id}">
        <td>${t.id}</td>
        <td>${t.name}</td>
        <td>${t.nationality}</td>
        <td>${t.url || ""}</td>
      </tr>`).join("");
    listContainer.innerHTML = `<table id="teams-table" class="data-table">
      <thead><tr><th>ID</th><th>Name</th><th>Nationality</th><th>URL</th></tr></thead>
      <tbody>${rows}</tbody></table>`;
  }

  listContainer.addEventListener("click", async (ev) => {
    const tr = ev.target.closest("tr");
    if (!tr) return;
    const id = tr.dataset.id;
    if (ev.target.classList.contains("edit-btn")) {
      const tds = tr.querySelectorAll("td");
      const num = tr.querySelector(".num").textContent.trim();
      const code = tr.querySelector(".code").textContent.trim();
      const name = tr.querySelector(".name").textContent.trim();
      const [forename, ...rest] = name.split(" ");
      const surname = rest.join(" ");
      const nationality = tr.querySelector(".nat").textContent.trim();
      const team = tr.querySelector(".team").textContent.trim();

      document.getElementById("_id").value = id;
      document.getElementById("num").value = num;
      document.getElementById("code").value = code;
      document.getElementById("forename").value = forename;
      document.getElementById("surname").value = surname;
      const res = await fetch("/api/drivers");
      const drivers = await res.json();
      const doc = drivers.find(d => d._id === id);
      if (doc) {
        if (doc.dob) {
          const dt = new Date(doc.dob);
          document.getElementById("dob").value = dt.toISOString().slice(0,10);
        } else {
          document.getElementById("dob").value = "";
        }
        document.getElementById("url").value = doc.url || "";
      }
      const natSel = document.getElementById("nation");
      for (const opt of natSel.options) {
        if (opt.text === nationality || opt.value === nationality) {
          natSel.value = opt.value;
          break;
        }
      }
      const teamSel = document.getElementById("team");
      for (const opt of teamSel.options) {
        if (opt.value === team) {
          teamSel.value = opt.value;
          break;
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (ev.target.classList.contains("delete-btn")) {
      if (!confirm("Delete this driver?")) return;
      const resp = await fetch(`/api/driver/${id}`, { method: "DELETE" });
      if (resp.ok) {
        fetchDriversAndRender();
      } else {
        alert("Failed to delete");
      }
    } else if (ev.target.classList.contains("inline-edit-btn")) {
      if (tr.classList.contains("inline-edit")) {
        const inputs = tr.querySelectorAll("input, select");
        const payload = { _id: id };
        inputs.forEach(inp => {
          payload[inp.name] = inp.value;
        });
        const res = await fetch("/api/driver", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) fetchDriversAndRender();
      } else {
        tr.classList.add("inline-edit");
        const num = tr.querySelector(".num").textContent.trim();
        const code = tr.querySelector(".code").textContent.trim();
        const nameCell = tr.querySelector(".name").textContent.trim();
        const [forename, ...rest] = nameCell.split(" ");
        const surname = rest.join(" ");
        const nat = tr.querySelector(".nat").textContent.trim();
        const team = tr.querySelector(".team").textContent.trim();

        tr.querySelector(".num").innerHTML = `<input name="num" value="${num}" />`;
        tr.querySelector(".code").innerHTML = `<input name="code" value="${code}" />`;
        tr.querySelector(".name").innerHTML = `<input name="forename" value="${forename}" /> <input name="surname" value="${surname}" />`;
        tr.querySelector(".nat").innerHTML = `<input name="nationality" value="${nat}" />`;
        tr.querySelector(".team").innerHTML = `<input name="team" value="${team}" />`;
        ev.target.textContent = "Save Inline";
      }
    }
  });

  resetBtn.addEventListener("click", (e) => {
    form.reset();
    document.getElementById("_id").value = "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v,k) => payload[k] = v);
    const res = await fetch("/api/driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      form.reset();
      document.getElementById("_id").value = "";
      fetchDriversAndRender();
    } else {
      alert("Failed to save");
    }
  });

  toggleViewBtn.addEventListener("click", async () => {
    if (currentView === "drivers") {
      const res = await fetch("/api/teams");
      const teams = await res.json();
      renderTeamsTable(teams);
    } else {
      fetchDriversAndRender();
    }
  });

  searchInput.addEventListener("input", async (e) => {
    const q = e.target.value.toLowerCase();
    const res = await fetch("/api/drivers");
    const drivers = await res.json();
    const filtered = drivers.filter(d => {
      const full = ((d.forename||"") + " " + (d.surname||"") + " " + (d.code||"")).toLowerCase();
      return full.includes(q);
    });
    renderDriversTable(filtered);
  });

  listContainer.addEventListener("click", (ev) => {
  });

});
