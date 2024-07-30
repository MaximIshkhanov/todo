(() => {
    const inputTasks = document.getElementById('input-tasks')
    const addButton = document.getElementById('add-button')
    const allTasksCounter = document.getElementById('all-tasks-counter')
    const completedTasksCounter = document.getElementById('completed-tasks-counter')
    const uncompletedTasksCounter = document.getElementById('uncompleted-tasks-counter')
    const deleteALLButton = document.getElementById('alldell')
    const tasksContainer = document.getElementById('tasks')
    const allСompletedButton = document.getElementById('all-completed-button')
    const allTasksButton = document.getElementById('all-tasks-button')
    const completedTasksButton = document.getElementById('completed-tasks-button')
    const uncompletedTasksButton = document.getElementById('uncompleted-tasks-button')
    const containerPagination = document.getElementById('pagination')
  
    let tasks = []
    let page = 1
    let filterType = 'all';
    const {_} = window
  
    async function addPlus() {
      const newTaskText = inputTasks.value
      if (newTaskText, tasks) {
        await addTask(newTaskText, tasks)
        inputTasks.value != '' 
      }
    }
  
    
   async function loader(){
      try{
      const response = await fetch('http://localhost:5000/task', {
        method: 'GET',
        mode: 'cors',
      })
      const data = await response.json();
      tasks.map(el => el.push(data))
      tasksRender(data);
    }catch(error){
      console.log(error, 'ухты ошибка')
    }}render();
    //add with Enter
     function addTaskWithEnter( event){
      const newTaskText = inputTasks.value
      if (event.key === 'Enter') {
        addTask(newTaskText, tasks)
        inputTasks.value = ''
      }
    }
  
  
    //check new task
    function isNotHaveTask(text, tasks) {
      let isNotHave = true
      tasks.forEach((task) => {
        if (task.text === text) {
          isNotHave = false
        }
      });
      return isNotHave
    }
  
  
    // render current task 
    async function render() {
      const renderedTasks = filtration(tasks);
      renderTasksCount(tasks)
      renderButtonPag(renderedTasks)
      const slicedTasks = sliceTasks(renderedTasks);
      await tasksRender(slicedTasks);
      
      
    }
  
    //add task
    async function addTask() {
      //makes one space of many spaces
      let start = inputTasks.value.indexOf(" ")
      let end = inputTasks.value.lastIndexOf(" ")
      let firstPart = inputTasks.value.slice(0,start)
      let secontPart = inputTasks.value.slice(end)
      inputTasks.value = firstPart + secontPart
      let newTaskText = inputTasks.value
      
      if (newTaskText && isNotHaveTask(newTaskText, tasks) && inputTasks.value!=" " && (newTaskText.length)<250 ) {
        const task = {
          text: _.escape(newTaskText),
        }
        
      try {
          const response = await fetch('http://localhost:5000/task', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(task),
          });console.log(task,tasks)
          const data = await response.json();
          tasks.push(data);
          inputTasks.value = ''
          page = Math.ceil((tasks.length) / 5);
          render(tasks)
  
      } catch (error) {
          console.error('Error adding task:', error);
      }
      }
    }
  
    //task list function
    function sliceTasks(list) {
      const start = 5 * (page - 1)
      const end = start + 5
      const pageTasks = list.slice(start, end)
      return pageTasks
    }
  
    async function tasksRender(list) {
      if (!Array.isArray(list)) {
        console.error('Expected an array but received:', list);
        return;
      }
      
    
      let htmlList = '';
      list.forEach((task) => {
        const cls = task.isComplete ?
          'todo__task todo__task_complete' :
          'todo__task'
        const checked = task.isComplete ? 'checked' : ''
        const taskHtml = `
            <div id="${task.id}" class="${cls}">
                <label class="todo__checkbox">
                    <input type="checkbox" ${checked} class="check" id ="${task.id}" >  
                    <div></div>    
                </label>
                <div id="text.id" class="todo__task-text">${(task.text)}</div>
                <input class="redact" value=${(task.text)} style="display: none" id = "redact.id" > 
                
                <div class="todo__task-del">-</div>
            </div>
            `
        htmlList = htmlList + taskHtml
      })
      tasksContainer.innerHTML = htmlList
      
    }
  
    //Tracking a click on a task checkbox
    function checkCheckBoxClick(event) {
      const target = event.target
      const isDeleteEl = target.classList.contains('todo__task-del')
      if (isDeleteEl) {
        const task = target.parentElement
        const taskId = task.getAttribute('id')
        deleteTask(taskId, tasks)
      }
    }
  
  
    
     // Task delete function on "-"
async function deleteTask(id) {
  try {
    const response = await fetch(`http://localhost:5000/task/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      const index = tasks.findIndex(task => task.id === Number(id));
      if (index !== -1 && (tasks.length%5)===1) {
        tasks.splice(index, 1);
        render(page=page-1);
      }
      else if (index !== -1 && (tasks.length%5)!==1) {
        tasks.splice(index, 1);
        render(page);
      }
    } else {
      console.error('Failed to delete task');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
  
}
      
    //All done
    function completeAll(event) {
      if (event) {
        tasks.forEach((task) => {
          if (task.isComplete === false) {
            task.isComplete = true
          }
          event.checked=false
        })
        render()
      }
    }
  
    //Function for changing the status of a task when you click on completed
    function changeTaskStatus(event) {
      if (event.target.classList.contains('check')) {
        const currentTaskId = Number(event.target.id)
        tasks.forEach((task) => {
          if (task.id === currentTaskId) {
            task.isComplete = !task.isComplete;
          }
        });
        render()
      }
    }
  
    //Delete everything completed
    async function deleteAllCompletedTasks() {
      const completedTasks = tasks.filter(task => task.isComplete);
      for (const task of completedTasks) {
          await deleteTask(task.id);
      }
  }
  
    //Displaying the number of tasks
    function renderTasksCount(tasks) {
      allTasksCounter.innerHTML = tasks.length
      const filteredCompletedTasks = tasks.filter((task) => task.isComplete === true)
      completedTasksCounter.innerHTML = filteredCompletedTasks.length
      uncompletedTasksCounter.innerHTML = allTasksCounter.innerHTML - completedTasksCounter.innerHTML
    }
  



    //Editing a task
    function editTask(event) {
      event.target.style.display = "none";
      const input = event.target.nextElementSibling
      input.style.display = "block";
      input.focus()
    }
    //Blur
    asfunction onBlurInput(event) {
      const target = event.target
      const currentTaskId = target.parentElement.id
      tasks.forEach(async(task) => {
        if (task.id ===  Number(currentTaskId)) {
          task.text = _.escape(target.value)
          await saveTaskText(target, currentTaskId)
          render()
        }
      })
      event.target.style.display = "block";
      event.target.nextElementSibling.style.display = "none";
    }
    function checkKey(event) {
      switch (event.key) {
        case 'Enter':
          document.activeElement.blur()
          
          break;
        default:
          break;
      }
    }
    //escape
    function saveByEnter(event) {
      if (event.keyCode === 27) {
        const target = event.target
        const currentTaskId = target.parentElement.id
        tasks.forEach((task) => {
          if (task.id === Number(currentTaskId)) {
            target.value = task.text
            event.target.style.display = "none";
            event.target.nextElementSibling.style.display = "block";
            
          }
        })
      }
    }

async function saveTaskText(target, currentTaskId) {
  console.log(target.value, currentTaskId)
  const newText = target.value;
  const task = tasks.find(task => task.id === currentTaskId);
  

  if (task && task.text !== newText) {
      task.text = newText;

      try {
          const response = await fetch(`http://localhost:5000/task/${currentTaskId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text: newText })
          });
          if (!response.ok) {
              console.error('Error updating task:', response.statusText);
          }
      } catch (error) {
          console.error('Error updating task:', error);
      }
  }
}



  
    //Tabulation
    function allTasks() {
      filterType = 'all';
      page = 1
      render()
    }
  
    function completedTasks() {
      filterType = 'completed';
      page = 1
      render()
    
    }
  
    function uncompletedTasks() {
      filterType = 'active';
      page = 1
      render()
    }
  
    function renderButtonPag(list) {
      const chBotton = Math.ceil((list.length) / 5)
      containerPagination.innerHTML = ''
      for (i = 1; i < (chBotton + 1); i++) {
        displayButton(i)
      }
    }
  
    function displayButton(page) {
      const pageButton = document.createElement('button');
      pageButton.textContent = page;
      pageButton.setAttribute('id', page);
      pageButton.setAttribute('class', "btn btn-primary");
      containerPagination.append(pageButton);
    }
  
    //when the button is clicked, updates the value of the current page
    function currentPaginationChangeOutput(event) {
      page = event.target.id
      render(page)
    }
  
  
    function filtration() {
      let filterTasks = [];
      switch (filterType) {
        case 'active':
          filterTasks = tasks.filter((item) => !item.isComplete);
          if ((filterTasks.length)%5===0){
            page =page -1
          }
          return filterTasks;
        case 'completed':
          filterTasks = tasks.filter((item) => item.isComplete);
          if ((filterTasks.length)%5===0){
            page =page -1
          }
          return filterTasks;
        default:
          return tasks;
      }
    }
  
    
    document.addEventListener('keyup',addTaskWithEnter)
    tasksContainer.addEventListener('click',checkCheckBoxClick)
    addButton.addEventListener('click', addPlus)
    allСompletedButton.addEventListener("click", completeAll)
    tasksContainer.addEventListener("click", changeTaskStatus)
    allTasksButton.addEventListener("click", allTasks)
    completedTasksButton.addEventListener("click", completedTasks)
    uncompletedTasksButton.addEventListener("click", uncompletedTasks)
    tasksContainer.addEventListener("keydown", saveByEnter)
    tasksContainer.addEventListener("keyup", checkKey)
    tasksContainer.addEventListener("blur", onBlurInput, true)
    tasksContainer.addEventListener("dblclick", editTask)
    containerPagination.addEventListener('click', currentPaginationChangeOutput)
    deleteALLButton.addEventListener('click', deleteAllCompletedTasks)
    loader()
  })()