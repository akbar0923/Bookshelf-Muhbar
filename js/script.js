const STORAGE_KEY = "BOOKSHELF_APPS";
let books = [];

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
  document.dispatchEvent(new Event("bookDataChanged"));
}

function loadData() {
  if (isStorageExist()) {
    const data = localStorage.getItem(STORAGE_KEY);
    books = data ? JSON.parse(data) : [];
    document.dispatchEvent(new Event("bookDataChanged"));
  }
}

function addBook(title, author, year, isComplete) {
  const id = +new Date();
  books.push({ id, title, author, year, isComplete });
  saveData();
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function moveBookToShelf(bookId, targetShelf) {
  const bookIndex = findBookIndex(bookId);

  if (bookIndex !== -1) {
    books[bookIndex].isComplete = targetShelf === "complete";
    saveData();
  }
}

function removeBook(bookId) {
  const book = findBook(bookId);
  if (!book) return;

  const isConfirmed = confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`);

  if (isConfirmed) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      saveData();
    }
  }
}

function refreshBookshelf() {
  const incompleteBookshelf = document.getElementById("incompleteBookshelfList");
  const completeBookshelf = document.getElementById("completeBookshelfList");

  incompleteBookshelf.innerHTML = "";
  completeBookshelf.innerHTML = "";

  for (const book of books) {
    const bookElement = createBookElement(book);

    if (book.isComplete) {
      completeBookshelf.appendChild(bookElement);
    } else {
      incompleteBookshelf.appendChild(bookElement);
    }
  }
}

function createBookElement(book) {
  const bookContainer = document.createElement("article");
  bookContainer.classList.add("book_item");

  const contentContainer = document.createElement("div");
  contentContainer.classList.add("content-container");

  const bookTitle = document.createElement("h3");
  bookTitle.innerText = book.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Author: ${book.author}`;

  const bookYear = document.createElement("p");
  bookYear.innerText = `Year: ${book.year}`;

  contentContainer.appendChild(bookTitle);
  contentContainer.appendChild(bookAuthor);
  contentContainer.appendChild(bookYear);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");

  if (book.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      moveBookToShelf(book.id, "incomplete");
    });
    actionContainer.appendChild(undoButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("complete-button");
    completeButton.addEventListener("click", function () {
      moveBookToShelf(book.id, "complete");
    });
    actionContainer.appendChild(completeButton);
  }

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", function () {
    removeBook(book.id);
  });
  actionContainer.appendChild(deleteButton);

  const bookContent = document.createElement("div");
  bookContent.classList.add("book-content");
  bookContent.appendChild(contentContainer);
  bookContent.appendChild(actionContainer);

  bookContainer.appendChild(bookContent);

  return bookContainer;
}

document.addEventListener("DOMContentLoaded", function () {
  const formAddBook = document.getElementById("inputBook");
  const formSearchBook = document.getElementById("searchBook");

  formAddBook.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = parseInt(document.getElementById("inputBookYear").value);
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    addBook(title, author, year, isComplete);
    formAddBook.reset();

    alert("Buku berhasil dimasukkan ke rak!");

    refreshBookshelf();
  });

  formSearchBook.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchTitle = document.getElementById("searchBookTitle").value;

    refreshBookshelf();

    const incompleteBookshelf = document.getElementById("incompleteBookshelfList");
    const completeBookshelf = document.getElementById("completeBookshelfList");

    incompleteBookshelf.innerHTML = "";
    completeBookshelf.innerHTML = "";

    for (const book of books) {
      if (book.title.toLowerCase().includes(searchTitle.toLowerCase())) {
        const bookElement = createBookElement(book);
        if (book.isComplete) {
          completeBookshelf.appendChild(bookElement);
        } else {
          incompleteBookshelf.appendChild(bookElement);
        }
      }
    }
  });

  if (isStorageExist()) {
    loadData();
  }
});

document.addEventListener("bookDataChanged", function () {
  refreshBookshelf();
});

const searchButton = document.getElementById("searchSubmit");

searchButton.addEventListener("click", function () {
  const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();

  const incompleteBookshelf = document.getElementById("incompleteBookshelfList");
  const completeBookshelf = document.getElementById("completeBookshelfList");

  incompleteBookshelf.innerHTML = "";
  completeBookshelf.innerHTML = "";

  for (const book of books) {
    if (book.title.toLowerCase().includes(searchTitle)) {
      const bookElement = createBookElement(book);
      if (book.isComplete) {
        completeBookshelf.appendChild(bookElement);
      } else {
        incompleteBookshelf.appendChild(bookElement);
      }
    }
  }

  // Scroll ke bawah ke daftar hasil pencarian
  const targetElement = document.getElementById("searchResults");
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth",
    });
  }
});
