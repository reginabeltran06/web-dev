document.addEventListener("DOMContentLoaded", () => {
    
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        new bootstrap.Tooltip(el);
    });

    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
        new bootstrap.Popover(el);
    });
    
    
    const scheduleForm = document.getElementById("scheduleForm");
    const scheduleTableBody = document.getElementById("scheduleTableBody");
    const scheduleModal = document.getElementById("scheduleModal");
    const loadingSpinner = document.getElementById("loadingSpinner");


    scheduleForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loadingSpinner.classList.remove("d-none");

    setTimeout(() => {
        const date = document.getElementById("date").value;
        const start = document.getElementById("startTime").value;
        const end = document.getElementById("endTime").value;
        const description = document.getElementById("activity").value;
        const place = document.getElementById("place").value || "-";
        const type = document.getElementById("type").value;
        const notes = document.getElementById("notes").value || "-";
        const busy = document.getElementById("freeBusy").checked;

        const icon = busy
        ? '<i class="bi bi-x-circle-fill text-danger" title="Busy"></i>'
        : '<i class="bi bi-check-circle-fill text-success" title="Free"></i>';

        const newRow = `
            <tr>
                <td>${icon}</td>
                <td>${date}</td>
                <td>${start}</td>
                <td>${end}</td>
                <td>${description}</td>
                <td>${place}</td>
                <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                <td>${notes}</td>
            </tr>
        `;

        if (scheduleTableBody.innerHTML.includes("No entries yet")) {
            scheduleTableBody.innerHTML = ''; // Clear all content
        }

        scheduleTableBody.insertAdjacentHTML("beforeend", newRow);

        loadingSpinner.classList.add("d-none");

        scheduleForm.reset();

        const modalInstance = bootstrap.Modal.getInstance(scheduleModal);
        modalInstance.hide();
        
        console.log("Schedule entry added successfully!");



    }, 500);

    });

});
