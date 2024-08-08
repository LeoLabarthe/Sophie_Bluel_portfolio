function showWork(el) {

    const work = 
        `<figure data-category="${el.categoryId}" data-id="${el.id}">
            <img src="${el.imageUrl}" alt="${el.title}">
            <figcaption>${el.title}</figcaption>
        </figure>`;
    
    document.querySelector('.gallery').insertAdjacentHTML('beforeend', work);

    const content = 
        `<figure data-id="${el.id}">
            <img src="${el.imageUrl}" alt="${el.title}">
            <button class="btn-del-icon" data-id="${el.id}">
                <img src="assets/icons/bin-icon.svg" alt="Icône d'une corbeille">
            </button>
        </figure>`;

    document.querySelector('.modal-gallery').insertAdjacentHTML('beforeend', content);
}

async function initWorks() {
    try {
        const resultFetch = await fetch('http://localhost:5678/api/works');
        const data = await resultFetch.json();

        for (const el of data) {
            showWork(el);
        }

        if(sessionStorage.getItem('token') !== null) {
            document.querySelectorAll('.btn-del-icon').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();

                    deleteWork(e.target.dataset.id);
                })
            })
        }
    }
    catch(error) {
        alert("Une erreur est survenue lors de l'initialisation des travaux.");
    }
}

async function addWork() {
    try {
        const picture = document.querySelector('.img-addwork').files[0];
        const title = document.querySelector('.title-addwork');
        const category = document.querySelector('.categories-addwork');
        
        if(picture.name <= 0 || (!['image/jpeg', 'image/png', 'image/jpg'].includes(picture.type))) {
            return alert("L'image n'est pas sélectionné ou son format est incorrect.");
        }
        if(title.value.length <= 0) {
            return alert("Veuillez entrer un titre.");
        }
        if(category.value.length <= 0) {
            return alert("Veuillez sélectionner une catégorie.");
        }

        const formData = new FormData(document.getElementById('addwork-form'));
        
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: formData
        })
        if(response.ok) {
            showPhotoGallery();

            const data = await response.json();
            showWork(data)
        }
    }
    catch(error) {
        alert("Une erreur est survenue lors de l'ajout d'un nouveau projet.");
    }
}

async function deleteWork(id) {
    try {
        const resultFetch = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!resultFetch.ok) {
            const errorText = await resultFetch.text();
            throw new Error(`Error ${resultFetch.status}: ${errorText}`);
        }

        const figures = document.querySelectorAll(`figure[data-id="${id}"]`);
        if (figures.length === 0) {
            console.warn(`No elements found with data-id="${id}"`);
        }
        figures.forEach(item => {
            item.parentNode.removeChild(item);
        });

    } catch (error) {
        alert("Une erreur est survenue lors de la suppression.");
    }
}


function filterWorks(category) {
    for (const figure of document.querySelector('.gallery').getElementsByTagName("figure")) {
        figure.style.display = category == figure.dataset.category || category == 0 ? "block" : "none";
    }
}

async function showCategories() {
    try {
        const resultFetch = await fetch('http://localhost:5678/api/categories');
        const data = await resultFetch.json();

        for (const el of data) {
            const liBtn = 
            `<li>
                <button class="btn" data-category="${el.id}">${el.name}</button>
            </li>`;

            document.querySelector('.btn-list').insertAdjacentHTML('beforeend', liBtn);

            document.querySelector('.categories-addwork').insertAdjacentHTML('beforeend', `<option value="${el.id}">${el.name}</option>`);
        }

        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(item => {
            item.addEventListener('click', (e) => {
                for (const btn of buttons) {
                    btn.classList.remove('btn-active');
                }
            
                e.target.classList.toggle("btn-active");
                filterWorks(e.target.dataset.category);
            })
        })
    } catch (e) {
        alert("Une erreur est survenue lors de la récupération des catégories.");
    }
}

function showPhotoGallery() {
    document.querySelector('.modal-comeback').style.visibility = 'hidden';

    document.querySelector('.modal-title').innerHTML = 'Galerie photo';

    document.querySelector('.modal-addwork').style.display = 'none';

    document.querySelector('.modal-gallery').style.display = 'grid';

    document.querySelector('.modal-bottom-btn').style.display = 'flex';

    document.querySelector('.btn-deletework').style.display = 'block';
}

initWorks();
showCategories();

if(sessionStorage.getItem('token') !== null) {
    document.querySelector('.editmode').style.display = 'flex';

    const linkLoginBtn = document.querySelector('.link-login');
    linkLoginBtn.innerHTML = "logout";
    linkLoginBtn.href = '#';
    
    linkLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('token');
        window.location = "index.html";
    })

    document.querySelector('.filter').style.display = 'none';

    const editBtn = document.querySelectorAll('.edit-btn');
    editBtn.forEach(item => {
        item.style.display = 'inline-flex';
    })

    editBtn.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.modal-container').style.display = 'flex';

            showPhotoGallery();
        })
    })

    document.querySelector('.btn-addwork').addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelector('.modal-comeback').style.visibility = 'visible';

        document.querySelector('.modal-title').innerHTML = 'Ajout photo';

        document.querySelector('.modal-gallery').style.display = 'none';

        document.querySelector('.modal-addwork').style.display = 'block';

        document.querySelector('.modal-bottom-btn').style.display = 'none';

        document.querySelector('.upload-work-img').style.display = 'none';

        document.querySelector('.upload-work-form').style.display = 'flex';

        document.querySelector('.btn-submit-work').style.backgroundColor = 'rgb(167, 167, 167)';

        document.querySelector('.title-addwork').value = '';

        document.querySelector('.img-addwork').value = '';

        document.querySelector('.categories-addwork').selectedIndex = 0;
    })

    document.querySelector('.modal-comeback').addEventListener('click', (e) => {
        e.preventDefault();
        showPhotoGallery();
    })

    document.querySelector('.modal-close').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.modal-container').style.display = 'none';
    })

    const modalContainer = document.querySelector('.modal-container');
    modalContainer.addEventListener('click', (e) => {
        if(e.target.classList.value == "modal-container")
            modalContainer.style.display = 'none';
    })

    const uploadWorkForm = document.querySelector('.upload-work-form');
    uploadWorkForm.addEventListener('change', (e) => {
        uploadWorkForm.style.display = 'none';

        const uploadWorkImg = document.querySelector('.upload-work-img');
        uploadWorkImg.style.display = 'flex';

       uploadWorkImg.innerHTML = '';

        uploadWorkImg.insertAdjacentHTML('beforeend', 
            `<img src="${URL.createObjectURL(e.target.files[0])}" 
            alt="${e.target.files[0].name}" 
            class="current-img-upload">`
        );
    })

    document.getElementById('addwork-form').addEventListener('input', () => {
        document.querySelector('.btn-submit-work').style.backgroundColor = document.querySelector('.title-addwork').value.length > 0 && document.querySelector('.img-addwork').value.length > 0 ? '' : 'rgb(167, 167, 167)';
    });

    document.getElementById('addwork-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addWork();
    })
}