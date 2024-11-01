document.addEventListener("DOMContentLoaded", () => {
    const languageSelector = document.getElementById("languageDropdown");
    let currentLanguage = "en";

    // Cargar las traducciones desde el archivo JSON
    fetch("js/translations.json")
        .then(response => response.json())
        .then(translations => {
            console.log("Translations loaded:", translations);  // Verificar carga de traducciones

            // Cambiar idioma al seleccionar una opción
            document.querySelectorAll("[data-lang]").forEach(item => {
                item.addEventListener("click", (event) => {
                    const selectedLanguage = event.target.closest("[data-lang]").dataset.lang;
                    console.log("Selected language:", selectedLanguage);  // Verificar selección

                    if (selectedLanguage && selectedLanguage !== currentLanguage) {
                        currentLanguage = selectedLanguage;
                        applyTranslations(translations[currentLanguage]);

                        // Cambiar el texto y la bandera del botón
                        languageSelector.querySelector("img").src = selectedLanguage === "es" 
                            ? "https://flagcdn.com/w40/es.png"
                            : "https://flagcdn.com/w40/us.png";
                        languageSelector.querySelector("span").textContent = translations[currentLanguage].language;
                    }
                });
            });

            // Aplicar el idioma inicial
            applyTranslations(translations[currentLanguage]);
        })
        .catch(error => console.error("Error loading translations:", error));  // Captura de errores en JSON

    // Función para actualizar el contenido de la página
    function applyTranslations(languageTexts) {
        console.log("Applying translations:", languageTexts);  // Verificar valores de traducciones
        document.querySelector("[data-translate='navbar_services']").textContent = languageTexts.navbar_services;
        document.querySelector("[data-translate='navbar_doubts']").textContent = languageTexts.navbar_doubts;
        document.querySelector("[data-translate='navbar_collections']").textContent = languageTexts.navbar_collections;
    }
});
