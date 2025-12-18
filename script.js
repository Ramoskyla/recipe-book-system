// ---------- Users & Recipes ----------
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

const navButtons = document.getElementById('navButtons');
const searchInput = document.getElementById('searchInput');
const recipeList = document.getElementById('recipeList');
const recipeForm = document.getElementById('recipeForm');
const modalTitle = document.getElementById('modalTitle');
const pagination = document.getElementById('pagination');

const homeScreen = document.getElementById('homeScreen');
const detailScreen = document.getElementById('detailScreen');
const backBtn = document.getElementById('backBtn');
const detailImage = document.getElementById('detailImage');
const detailName = document.getElementById('detailName');
const detailCategory = document.getElementById('detailCategory');
const detailIngredients = document.getElementById('detailIngredients');
const detailInstructions = document.getElementById('detailInstructions');
const detailButtons = document.getElementById('detailButtons');

let currentCategory = 'All';
let currentPage = 1;
const recipesPerPage = 6;

// ---------- Navbar ----------
function updateNav() {
    if (currentUser) {
        navButtons.innerHTML = `
            <li class="nav-item"><span class="navbar-text text-white me-2">Hello, ${currentUser.username}</span></li>
            <li class="nav-item"><button class="btn btn-light" id="logoutBtn">Logout</button></li>
            <li class="nav-item ms-2"><button class="btn btn-light" id="addRecipeBtn">Add Recipe</button></li>
        `;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateNav();
            displayRecipes();
        });
        document.getElementById('addRecipeBtn').addEventListener('click', () => {
            recipeForm.reset();
            document.getElementById('recipeId').value = '';
            modalTitle.textContent = 'Add Recipe';
            new bootstrap.Modal(document.getElementById('recipeModal')).show();
        });
    } else {
        navButtons.innerHTML = `
            <li class="nav-item"><button class="btn btn-light me-2" id="loginBtn">Login</button></li>
            <li class="nav-item"><button class="btn btn-light" id="registerBtn">Register</button></li>
        `;
        document.getElementById('loginBtn').addEventListener('click', () => new bootstrap.Modal(document.getElementById('loginModal')).show());
        document.getElementById('registerBtn').addEventListener('click', () => new bootstrap.Modal(document.getElementById('registerModal')).show());
    }
}
updateNav();

// ---------- Login ----------
document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        updateNav();
        displayRecipes();
    } else {
        alert("Invalid username or password!");
    }
});

// ---------- Register ----------
document.getElementById('registerForm').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    if (users.some(u => u.username === username)) {
        alert("Username already exists!");
        return;
    }
    const user = { id: Date.now(), username, password };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration successful! You can now login.");
    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
});

// ---------- Display Recipes ----------
function displayRecipes(filter = searchInput.value, category = currentCategory) {
    let filtered = recipes.filter(r =>
        (r.name.toLowerCase().includes(filter.toLowerCase()) ||
         r.ingredients.toLowerCase().includes(filter.toLowerCase())) &&
        (category === 'All' || r.category === category)
    );

    const totalPages = Math.ceil(filtered.length / recipesPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * recipesPerPage;
    const end = start + recipesPerPage;
    const recipesToShow = filtered.slice(start, end);

    recipeList.innerHTML = '';
    if (recipesToShow.length === 0) {
        recipeList.innerHTML = '<p class="text-center">No recipes found.</p>';
        pagination.innerHTML = '';
        return;
    }

    recipesToShow.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card recipe-card h-100">
                ${recipe.image ? `<img src="${recipe.image}" class="card-img-top" alt="${recipe.name}">` : ''}
                <div class="card-body">
                    <h5 class="card-title">${recipe.name}</h5>
                </div>
            </div>
        `;
        recipeList.appendChild(card);

        card.addEventListener('click', () => showDetail(recipe.id));
    });

    renderPagination(totalPages);
}

// ---------- Recipe Detail ----------
function showDetail(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    homeScreen.classList.add('d-none');
    detailScreen.classList.remove('d-none');

    detailImage.src = recipe.image || '';
    detailName.textContent = recipe.name;
    detailCategory.textContent = recipe.category;
    detailIngredients.innerHTML = recipe.ingredients.replace(/\n/g, '<br>');
    detailInstructions.innerHTML = recipe.instructions.replace(/\n/g, '<br>');

    detailButtons.innerHTML = '';

    // Owner buttons
    if (currentUser && recipe.ownerId === currentUser.id) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-warning me-2';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editRecipe(recipe.id));
        detailButtons.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger me-2';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            deleteRecipe(recipe.id);
            backToHome();
        });
        detailButtons.appendChild(deleteBtn);
    }

    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-primary';
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => downloadRecipe(recipe.id));
    detailButtons.appendChild(downloadBtn);
}

// ---------- Back Button ----------
backBtn.addEventListener('click', backToHome);
function backToHome() {
    detailScreen.classList.add('d-none');
    homeScreen.classList.remove('d-none');
    displayRecipes();
}

// ---------- Pagination ----------
function renderPagination(totalPages) {
    pagination.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', e => {
            e.preventDefault();
            currentPage = i;
            displayRecipes();
        });
        pagination.appendChild(li);
    }
}

// ---------- Add / Edit Recipe ----------
recipeForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentUser) {
        alert("You must be logged in to add a recipe!");
        return;
    }
    const id = document.getElementById('recipeId').value;
    const name = document.getElementById('recipeName').value.trim();
    const category = document.getElementById('recipeCategory').value;
    const ingredients = document.getElementById('recipeIngredients').value.trim();
    const instructions = document.getElementById('recipeInstructions').value.trim();
    const image = document.getElementById('recipeImage').value.trim();

    if (id) {
        const index = recipes.findIndex(r => r.id == id);
        if (index !== -1 && recipes[index].ownerId === currentUser.id) {
            recipes[index] = { ...recipes[index], name, category, ingredients, instructions, image };
        } else {
            alert("You can only edit your own recipe!");
        }
    } else {
        recipes.push({ id: Date.now(), name, category, ingredients, instructions, image, ownerId: currentUser.id });
    }

    localStorage.setItem('recipes', JSON.stringify(recipes));
    recipeForm.reset();
    modalTitle.textContent = 'Add Recipe';
    bootstrap.Modal.getInstance(document.getElementById('recipeModal')).hide();
    displayRecipes();
});

// ---------- Edit Recipe ----------
function editRecipe(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!currentUser || recipe.ownerId !== currentUser.id) {
        alert("You can only edit your own recipe!");
        return;
    }
    document.getElementById('recipeId').value = recipe.id;
    document.getElementById('recipeName').value = recipe.name;
    document.getElementById('recipeCategory').value = recipe.category;
    document.getElementById('recipeIngredients').value = recipe.ingredients;
    document.getElementById('recipeInstructions').value = recipe.instructions;
    document.getElementById('recipeImage').value = recipe.image;
    modalTitle.textContent = 'Edit Recipe';
    new bootstrap.Modal(document.getElementById('recipeModal')).show();
}

// ---------- Delete Recipe ----------
function deleteRecipe(recipeId) {
    const index = recipes.findIndex(r => r.id === recipeId);
    if (index === -1) return;
    const recipe = recipes[index];
    if (!currentUser || recipe.ownerId !== currentUser.id) {
        alert("You can only delete your own recipe!");
        return;
    }
    if (confirm("Are you sure you want to delete this recipe?")) {
        recipes.splice(index, 1);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        displayRecipes();
    }
}

// ---------- Download Recipe ----------
function downloadRecipe(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    const text = `Recipe: ${recipe.name}\nCategory: ${recipe.category}\n\nIngredients:\n${recipe.ingredients}\n\nInstructions:\n${recipe.instructions}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ---------- Search & Filter ----------
searchInput.addEventListener('input', () => {
    currentPage = 1;
    displayRecipes();
});

function filterCategory(cat) {
    currentCategory = cat;
    currentPage = 1;
    displayRecipes();
}

// ---------- Initial Display ----------
displayRecipes();
