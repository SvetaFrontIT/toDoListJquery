//За основу берём ДЗ 16. Todolist (на максималках)

//Необходимо сделать так, чтоб у нас была кнопка Добавить при клике на которую отображался Dialog из jQueryUI. 
//В нём форма с двумя полями Todo Name - input и Done - checkbox. При нажатии на кнопку Добавить внутри Dialog 
//отправляем запрос на create с названием и статусом, после чего закрываем Dialog и добавляем новый элемент вверх списка.

//При нажатии на edit icon показываем Dialog с такими же полями как те, что описаны выше, но они заполнены в 
//значения выбранной todo. После нажатия на Обновить внутри Edit Dialog отправляем запрос на обновлении и после 
//этого закрываем Edit Dialog и обновляем todo в списке.

//Если по ДЗ что то не понятно, пересмотрите конец занятия где я об этом рассказываю.


const $list = $('.js-list');
const $emptyMessage = $('.js-empty');

const $addFormElement = $('.js-add-modal');
const $addButtonElement = $('.js-add-btn');
const $sendButtonElement = $('.js-send-btn');
const $dataFormElement = $('form[name="new-data"]');
const $inputFormElement = $('[name="new-text"]');
const $checkboxFormElement = $('[name="new-checkbox"]');

const $editFormElement = $('.js-edit-modal');
const $itemDataFormElement = $('form[name="item-data"]');
const $itemTextFormElement = $('[name="item-text"]');
const $isDoneFormElement = $('[name="item-checkbox"]');
const $sendEditButtonElement = $('.js-send-edit-btn');
const $cancelButtonElement = $('.js-cancel-btn');




class ToDosRepository {
    constructor() {
        this._todos = [];
    }
    set todos(toDoList) {
        this._todos = toDoList;
    }
    get todos() {
        return this._todos;
    }
    findElementById(id) {
        return this.todos.find(todo => todo.id === Number(id));
    }
}
const toDosRepository = new ToDosRepository;

class ToDosRequests {
    static sendGetToDoListRequest() {
        return new Promise((resolve, reject) => {
            $.ajax('https://jsonplaceholder.typicode.com/todos', {
                success: (data) => {
                    resolve(data);
                },
                error: (errorThrown) => {
                    reject(new Error(errorThrown));
                },
            });
        });
    }
    static sendPostToDoRequest(newListItem) {
        return new Promise((resolve, reject) => {
            $.ajax('https://jsonplaceholder.typicode.com/todos', {
                method: "POST",
                data: newListItem,
                success: (data) => {
                    resolve(data);
                },
                error: (errorThrown) => {
                    reject(new Error(errorThrown));
                },
            });
        });
    }
    static sendPutRequest(toDoItem) {
        return new Promise((resolve, reject) => {
            $.ajax(`https://jsonplaceholder.typicode.com/todos/${toDoItem.id}`, {
                method: "PUT",
                data: JSON.stringify(toDoItem),
                success: (data) => {
                    resolve(data);
                },
                error: (errorThrown) => {
                    reject(new Error(errorThrown));
                },
            });
        });
    }
    static sendDleteToDoListRequest(id) {
        return new Promise((resolve, reject) => {
            $.ajax(`https://jsonplaceholder.typicode.com/todos/${id}`, {
                method: "DELETE",
                error: (errorThrown) => {
                    reject(new Error(errorThrown));
                },
            });
        });
    }
}
class ToDosLogic {
    static getToDoList() {
        const promise = ToDosRequests.sendGetToDoListRequest();
        promise.then((toDoList) => {
            renderListItems(toDoList);
            toDosRepository.todos = toDoList;
        });
    }
    static addNewTodo() {
        const newListItem = {
            userId: 0,
            id: toDosRepository.todos.length + 1,
            title: $inputFormElement[0].value,
            completed: $checkboxFormElement[0].checked,
        };
        ToDosRequests.sendPostToDoRequest(newListItem);
        $list.html(getToDoListItem(newListItem) + $list.html());
        toDosRepository.todos = [...toDosRepository.todos, newListItem];
    }
    static toggleStatusOnListItem(event) {
        if (event.target.classList.contains("js-item")) {
            const isCompleted = event.target.dataset.completed === 'true';
            event.target.dataset.completed = isCompleted ? 'false' : 'true';
            const item = getItemFromHTML(event.target);
            ToDosRequests.sendPutRequest(item);
            editRepositoryItemStatus(event.target);
        };
    }
    static editTodoItem(event) {
        const currentItem = event.target.closest('li');
        const id = currentItem.id;
        const value = currentItem.innerText;
        const isDone = currentItem.dataset.completed;
        showEditForm(id, value, isDone);
    }

    static deleteElement(event) {
        const currentItem = event.target.closest('li');
        const id = +(currentItem.id)
        ToDosRequests.sendDleteToDoListRequest(id);
        currentItem.remove();
        toDosRepository.todos = toDosRepository.todos.filter(todo => todo.id !== id);
    }

}
//LISTENERS

function createAddEventListener() {
    $addButtonElement.click(() => {
        $addFormElement.dialog('open');
    });
}

function createSendEventListener() {
    $sendButtonElement.click(() => {
        ToDosLogic.addNewTodo();
        cleanForm();
        $addFormElement.dialog('close');
    })
}

function createStatusEventListener() {
    $list.click((event) => ToDosLogic.toggleStatusOnListItem(event));
}

function createEditEventListener() {
    $list.click((event) => {
        if (event.target.classList.contains("js-action-edit")) {
            ToDosLogic.editTodoItem(event);
        }
    });
}

function createDeleteEventListener() {
    $list.click((event) => {
        if (event.target.classList.contains("js-action-delete")) {
            ToDosLogic.deleteElement(event);
        }
    });
}

function createEditSendEventListener() {
    $sendEditButtonElement.click(() => {
        getEditedData();
        return;
    });
}

// GETTING TOOLS
function getEditedData() {
    const editedListItem = {
        userId: 0,
        id: $isDoneFormElement[0].id,
        title: $itemTextFormElement[0].value,
        completed: $isDoneFormElement[0].checked,
    };
    ToDosRequests.sendPutRequest(editedListItem);
    editRepositoryItem(editedListItem);
    editHtmlItem(editedListItem);
    cleanForm();
    $isDoneFormElement.removeAttr('id');
    $editFormElement.dialog('close');
}

function getItemFromHTML(toDoItem) {
    return {
        id: toDoItem.id,
        title: toDoItem.firstChild.nodeValue,
        completed: toDoItem.dataset.completed,
    };
}

function getToDoListItem(listItem) {
    return `<li class="list-group-item js-item" data-completed = "${listItem.completed}" id=${listItem.id}>
                ${listItem.title}
                <span class = "icons">
                    <i class="bi bi-pencil action js-action-edit"></i>
                    <i class="bi bi-trash action js-action-delete"></i>
                </span>
            </li>`;
}

function showEditForm(id, value, isDone) {
    $isDoneFormElement[0].id = id;
    $editFormElement.dialog('open');
    $itemTextFormElement[0].value = `${value}`;
    const isCompleted = isDone === 'false';
    $isDoneFormElement[0].checked = isCompleted ? false : true;
}

// WRITTING TOOLS

function renderListItems(toDoList) {
    const listItems = toDoList.map((toDoListItem) =>
        getToDoListItem(toDoListItem)
    );
    if (listItems) {
        $emptyMessage.attr('hidden', 'true');
        $list.removeAttr('hidden');
        $list.html(listItems.join(""));
    }
}

function editHtmlItem(editedListItem) {
    const $htmlItem = $(`#${editedListItem.id}`);
    $htmlItem.replaceWith(getToDoListItem(editedListItem));
}

function editRepositoryItemStatus(currentItem) {
    const id = +(currentItem.id);
    const repositoryElement = toDosRepository.findElementById(id);
    const isCompleted = repositoryElement.completed === 'false';
    repositoryElement.completed = isCompleted ? 'true' : 'false';
}

function editRepositoryItem(editedListItem) {
    const repositoryElement = toDosRepository.findElementById(editedListItem.id);
    repositoryElement.title = editedListItem.title;
    repositoryElement.completed = editedListItem.completed;
}

//UTILS

function cleanForm() {
    $dataFormElement[0].reset();
    $itemDataFormElement[0].reset();
}

function initModals() {
    const baseModalOptions = {
        autoOpen: false,
        modal: true,
    };
    $addFormElement.dialog(baseModalOptions);
    $editFormElement.dialog(baseModalOptions);
}


init();

function init() {
    initModals()
    ToDosLogic.getToDoList();
    createAddEventListener();
    createSendEventListener();
    createEditSendEventListener();
    createEditEventListener()
    createStatusEventListener();
    createDeleteEventListener();
}