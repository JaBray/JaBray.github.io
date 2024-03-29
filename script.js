let selectedTypes = [];
let randomPokemonTypes = [];
let totalGuesses = 0;
let correctGuesses = 0;

// Function to fetch random Pokemon data from PokeAPI
async function fetchRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1025) + 1; // There are 1025 Pokemon in total
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const data = await response.json();
    randomPokemonTypes = data.types.map(type => type.type.name.toLowerCase());
    return data;
}

// Function to fetch all Pokemon types
async function fetchAllPokemonTypes() {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();
    return data.results.filter(type => type.name !== "unknown" && type.name !== "shadow");
}

// Function to update the HTML with the fetched Pokemon data
async function updatePokemonInfo() {
    selectedTypes = []; // Reset selected types
    const pokemonData = await fetchRandomPokemon();
    const pokemonName = pokemonData.name;
    const pokemonSprite = pokemonData.sprites.front_default;

    document.getElementById('pokemon-name').textContent = pokemonName.toUpperCase();
    document.getElementById('pokemon-img').setAttribute('src', pokemonSprite);

    // Display Pokemon types
    const typesGrid = document.getElementById('types-grid');
    typesGrid.innerHTML = ''; // Clear previous types

    const allTypes = await fetchAllPokemonTypes();
    allTypes.forEach(async type => {
        const typeId = type.url.split('/').slice(-2, -1)[0];
        const typeImg = document.createElement('img');
        typeImg.setAttribute('src', `sprites-master/sprites/types/generation-vi/x-y/${typeId}.png`);
        typeImg.setAttribute('alt', type.name);
        typeImg.setAttribute('class', 'type-img');
        typeImg.addEventListener('click', () => toggleTypeSelection(type.name));
        typesGrid.appendChild(typeImg);
    });
}

// Function to toggle type selection
function toggleTypeSelection(typeName) {
    const index = selectedTypes.indexOf(typeName);
    if (index === -1) {
        if (selectedTypes.length < 2) {
            selectedTypes.push(typeName);
        }
    } else {
        selectedTypes.splice(index, 1);
    }

    const typeImages = document.querySelectorAll('.type-img');
    typeImages.forEach(img => {
        if (selectedTypes.includes(img.alt)) {
            img.classList.add('type-selected');
        } else {
            img.classList.remove('type-selected');
        }
    });
}

async function checkMatch() {
    totalGuesses++; // Increment total guesses regardless of the outcome

    if (selectedTypes.length === 0) {
        setMessage('Please select at least one type.', 'red');
        return;
    }

    const pokemonName = document.getElementById('pokemon-name').textContent.toLowerCase();
    const correctTypesLowerCase = randomPokemonTypes.map(type => type.toLowerCase()).sort();
    const selectedTypesLowerCase = selectedTypes.map(type => type.toLowerCase()).sort();

    const isMatched = JSON.stringify(correctTypesLowerCase) === JSON.stringify(selectedTypesLowerCase);
    const correctMessage = `${pokemonName} is: ${correctTypesLowerCase.map(type => type.toUpperCase()).join(' and ')}.`;

    if (isMatched) {
        correctGuesses++; // Increment correct guesses if types match
        setMessage(`Correct! ${correctMessage}`, 'green');
    } else {
        setMessage(`Incorrect! ${correctMessage}`, 'red');
        
    }
	updatePokemonInfo(); // Generate new Pokémon
    updateScore(); // Update the score after each guess
}


// Function to set message below the submit button
function setMessage(message, color) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.color = color;
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${correctGuesses}/${totalGuesses}`;
}

// Event listener for the submit button
document.getElementById('submit-button').addEventListener('click', checkMatch);

// Call updatePokemonInfo when the page loads
updatePokemonInfo();
