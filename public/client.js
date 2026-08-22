const cityForm = document.querySelector("#cityForm");
const customerCitiesSelect = document.querySelector("#customerCity");

cityForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(cityForm);

    const city = {
        name: formData.get("name"),
        country: formData.get("country")
    };

    try {
        const response = await fetch("/api/cities", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(city)
        });

        if (response.status === 409) {
            alert("city already exists.");
            cityForm.reset();
            return;
        }

        if (!response.ok) {
            alert("something went wrong.");
            return;
        }

        alert("City added succesfully.");
        await loadCitiesFromDb();

        cityForm.reset();

    } catch(error) {
        console.error(error);
        alert("could not connect to server");
    }
});

async function loadCitiesFromDb() {
    try {
        const response = await fetch("/api/cities");

        if (!response.ok) {
            throw new Error("Failed to load cities");
        }

        const cities = await response.json();

        customerCitiesSelect.innerHTML = `
            <option value="">Select City</option>
        `;

        cities.forEach(city => {
            const newOption = document.createElement("option");
            newOption.value = city._id;
            newOption.textContent = city.name;

            customerCitiesSelect.appendChild(newOption);
        });

    } catch (error) {
        console.error(error);
    }
};

loadCitiesFromDb();