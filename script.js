document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://internet-cafe-api-ron-cada-projects.vercel.app";

    const showSection = (sectionId) => {
        document.querySelectorAll("main section").forEach(section => {
            section.style.display = section.id === sectionId ? "block" : "none";
        });
    };
    showSection("sessions");

    const createActionButtons = (id, type) => {
        const td = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => openEditModal(id));
        td.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this session?")) {
                deleteItem(id, type);
            }
        });
        td.appendChild(deleteButton);

        return td;
    };

    const fetchData = (endpoint, tableId, columns) => {
        fetch(`${apiBaseUrl}/${endpoint}`)
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById(tableId)?.querySelector("tbody");
                if (!tableBody) {
                    console.error(`Table body not found for table ID: ${tableId}`);
                    return;
                }
                tableBody.innerHTML = "";
                data.forEach(item => {
                    const tr = document.createElement("tr");
                    columns.forEach(column => {
                        const td = document.createElement("td");
                        td.textContent = item[column];
                        tr.appendChild(td);
                    });
                    tr.appendChild(createActionButtons(item.id, endpoint));
                    tableBody.appendChild(tr);
                });
            })
            .catch(error => console.error(`Error fetching ${endpoint}:`, error));
    };
    fetchData("sessions", "session-table", ["id", "start_time", "end_time", "status", "paid_amount"]);

    const addItem = (type, item) => {
        fetch(`${apiBaseUrl}/${type}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
        })
        .then(response => response.json())
        .then(data => {
            console.log(`New ${type} added:`, data);
            alert("Added session successfully!");
            fetchData(type, "session-table", getColumns(type));
        })
        .catch(error => console.error(`Error adding new ${type}:`, error));
    };

    const openEditModal = (id) => {
        fetch(`${apiBaseUrl}/sessions/${id}`)
            .then(response => response.json())
            .then(data => {
                const fields = ["edit-session-id", "edit-session-start-time", "edit-session-end-time", "edit-session-status", "edit-session-paid-amount"];
                fields.forEach(field => {
                    document.getElementById(field).value = data[field.replace("edit-session-", "")];
                });
                document.getElementById("edit-session-modal").style.display = "block";
            })
            .catch(error => console.error(`Error fetching session with ID ${id}:`, error));
    };

    const updateItem = (id, item) => {
        fetch(`${apiBaseUrl}/sessions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
        })
        .then(response => response.json())
        .then(data => {
            console.log(`Session with ID ${id} updated:`, data);
            alert("Edited session successfully!");
            fetchData("sessions", "session-table", getColumns("sessions"));
        })
        .catch(error => console.error(`Error updating session with ID ${id}:`, error));
    };

    const deleteItem = (id, type) => {
        fetch(`${apiBaseUrl}/${type}/${id}`, { method: "DELETE" })
            .then(response => {
                if (response.ok) {
                    console.log(`${type} with ID ${id} deleted successfully`);
                    alert("Deleted session successfully!");
                    fetchData(type, "session-table", getColumns(type));
                } else {
                    console.error(`Error deleting ${type} with ID ${id}`);
                }
            })
            .catch(error => console.error(`Error deleting ${type} with ID ${id}:`, error));
    };

    const getColumns = (type) => {
        return type === "sessions" ? ["id", "start_time", "end_time", "status", "paid_amount"] : [];
    };

    document.getElementById("add-session").addEventListener("click", () => {
        document.getElementById("session-modal").style.display = "block";
        document.getElementById("session-start-time").value = new Date().toTimeString().slice(0, 5);
    });

    document.getElementById("close-session-modal").addEventListener("click", () => {
        document.getElementById("session-modal").style.display = "none";
    });

    document.getElementById("close-edit-session-modal").addEventListener("click", () => {
        document.getElementById("edit-session-modal").style.display = "none";
    });

    document.getElementById("session-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${apiBaseUrl}/sessions/`);
            const data = await response.json();
            const newSessionId = `session${data.length + 1}`;
            const sessionData = {
                id: newSessionId,
                start_time: document.getElementById("session-start-time").value,
                end_time: document.getElementById("session-end-time").value,
                status: document.getElementById("session-status").value,
                paid_amount: document.getElementById("session-paid-amount").value
            };
            addItem("sessions", sessionData);
            document.getElementById("session-modal").style.display = "none";
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    });

    document.getElementById("edit-session-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const id = document.getElementById("edit-session-id").value;
        const updatedSessionData = {
            id,
            start_time: document.getElementById("edit-session-start-time").value,
            end_time: document.getElementById("edit-session-end-time").value,
            status: document.getElementById("edit-session-status").value,
            paid_amount: document.getElementById("edit-session-paid-amount").value
        };
        updateItem(id, updatedSessionData);
        document.getElementById("edit-session-modal").style.display = "none";
    });
});
