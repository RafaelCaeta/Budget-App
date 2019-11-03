/*------------------------
     BUDGET CONTROLLER
--------------------------*/

var budgetController = (function () {

       // OBJECT CONSTRUCTORS

       var Expense = function(id, description, value) {
              this.id = id;
              this.description = description;
              this.value = value;
       };

       var Income = function(id, description, value) {
              this.id = id;
              this.description = description;
              this.value = value;
       };

       // STATE STRUCTURE

        var state = {
              listItems: {
                     inc: [],
                     exp: []
              },
              totals: { 
                     inc: 0,
                     exp: 0 
              },
              budget: 0,
       };

       idCounter = 0;

       // PRIVATE METHODS

       var calculateTotals = function(type) {
              sum = 0;

              state.listItems[type].forEach(function(el) {
                     sum += el.value;
              });

              state.totals[type] = sum;
              return sum;
       };

       // PUBLIC METHODS

       var addItem = function(type, desc, val) {
              var newItem;
              var id = idCounter;
              idCounter++;

              newItem = type === 'inc' ? new Income(id, desc, val) : new Expense(id, desc, val);

              state.listItems[type].push(newItem);
              
              return newItem;
       }

       var calculateBudget = function () {
              var incomeTotal = calculateTotals('inc');
              var expensesTotal = calculateTotals('exp');

              state.budget = incomeTotal - expensesTotal;
       }

       var deleItem = function(type, id) {
              state.listItems[type].forEach(function(el, index) {
                     if (el.id === id) {
                            state.listItems[type].splice(index, 1); 
                     } 
              }); 
       }

       var getBudget = function() {
              return {
                     value: state.budget,
                     totalIncome: state.totals.inc,
                     totalExpenses: state.totals.exp                            
              }
       }

       return {
              addItem: addItem,
              calculateBudget: calculateBudget,
              deleItem: deleItem,
              getBudget: getBudget
       };
})();

/*------------------------
       UI CONTROLLER
--------------------------*/

var UIController = (function () {

       var DOMelements = {
              budgetLabel: document.querySelector('.budget'),
              deleteButton: document.querySelector('.deleteButton'), 
              expensesButton: document.querySelector('#expensesButton'),
              expensesDescription: document.querySelector('#expensesDescription'),
              expensesListContainer: document.querySelector('.bills__list--expenses'),
              expensesValue: document.querySelector('#expensesValue'),
              incomeButton: document.querySelector('#incomeButton'), 
              incomeDescription: document.querySelector('#incomeDescription'),              
              incomeListContainer: document.querySelector('.bills__list--income'),
              incomeValue: document.querySelector('#incomeValue'),
              totalIncome: document.querySelector('#totalIncome'),
              totalExpenses: document.querySelector('#totalExpenses'),
       };

       // PRIVATE METHODS

       var currencyFormatter = function(budget) {
              currencyBlueprint = new Intl.NumberFormat('pt-PT', {
                     style: 'currency',
                     currency: 'EUR'
              })

              formattedBudget = currencyBlueprint.format(budget);
              return formattedBudget;  
       } 

       // PUBLIC METHODS

       var addItemToList = function(type, obj) {
              var html, newHtml, element;

              if (type === 'inc') {
                     element = DOMelements.incomeListContainer;
                     html = '<li id="inc-%id%"><span><ion-icon class="icon" name="close-circle"></ion-icon></span><p class="description">%description%</p><p class="value--income">+ %value%</p></li>';
              } else if (type === 'exp') {
                     element = DOMelements.expensesListContainer;
                     html = '<li id="exp-%id%"><span><ion-icon class="icon" name="close-circle"></ion-icon></span><p class="description">%description%</p><p class="value--expenses">- %value%</p></li>';
              }  

              newHtml = html.replace('%id%', obj.id);
              newHtml = newHtml.replace('%description%', obj.description);
              newHtml = newHtml.replace('%value%', currencyFormatter(obj.value));

              element.insertAdjacentHTML('beforeend', newHtml);
       }

       var clearInput = function(type) {
              if (type === 'inc') {
                     DOMelements.incomeDescription.value = ""; 
                     DOMelements.incomeValue.value = ""; 
              } else if (type === 'exp') {
                     DOMelements.expensesDescription.value = ""; 
                     DOMelements.expensesValue.value = "";  
              }
       }

       var displayBudget = function(budget) {
              var element = DOMelements.budgetLabel;
 
              var displayingBudget = currencyFormatter(budget.value);

              if (budget.value > 0) {
                     element.textContent = '+ ' + displayingBudget; 
                     element.classList.remove('budget--negative');
                     element.classList.add('budget--positive'); 
              } else if (budget.value < 0) {
                     element.textContent = displayingBudget;
                     element.classList.remove('budget--positive');
                     element.classList.add('budget--negative'); 
              } else if (budget.value === 0) {
                     element.textContent = displayingBudget; 
                     element.classList.remove('budget--positive');
                     element.classList.remove('budget--negative'); 
              }
       }

       var displayTotals = function(budget) {
              DOMelements.totalIncome.textContent = currencyFormatter(budget.totalIncome);
              DOMelements.totalExpenses.textContent = currencyFormatter(budget.totalExpenses); 
       }

       var getDOMelements = function() {
              return DOMelements;               
       }

       var getExpensesInputs = function() {
              return {
                     description: expensesDescription.value,
                     value: Number(expensesValue.value)
              }
       }

       var getIncomeInputs = function() {
              return {
                     description: incomeDescription.value,
                     value: Number(incomeValue.value)
              }
       }

       var removeItemFromList = function(id) {
              var removedElement = document.getElementById(id);
              removedElement.parentNode.removeChild(removedElement);
       }

       return {
              addItemToList: addItemToList,
              clearInput: clearInput,
              displayBudget: displayBudget,
              displayTotals: displayTotals,
              getDOMelements: getDOMelements,
              getExpensesInputs: getExpensesInputs,
              getIncomeInputs: getIncomeInputs,
              removeItemFromList: removeItemFromList
       };

})();

/*------------------------
       MAIN CONTROLLER
--------------------------*/

var mainController = (function (budgetCtrl, UICtrl) {
       
       var setUpEventListeners = function () {
              var DOM = UICtrl.getDOMelements();
              
              DOM.incomeButton.addEventListener('click', ctrlAddItem);
              DOM.expensesButton.addEventListener('click', ctrlAddItem);
              DOM.incomeListContainer.addEventListener('click', ctrlDeleteItem);
              DOM.expensesListContainer.addEventListener('click', ctrlDeleteItem); 
       };

       var updateBudget = function() {
              budgetCtrl.calculateBudget();
              var budget = budgetCtrl.getBudget();
              UICtrl.displayBudget(budget);
              UICtrl.displayTotals(budget);
       };

       var ctrlAddItem = function(event) {
              var incomeInput = UICtrl.getIncomeInputs();
              var expensesInput = UICtrl.getExpensesInputs();   
              var buttonId = event.target.id;
              var type;

              buttonId === 'incomeButton' ? type = 'inc' : type = 'exp';

              if ((incomeInput.value > 0 && incomeInput.description != "") || (expensesInput.value > 0 && expensesInput.description != "")) {
                     var newItem
                     
                     if (type === 'inc') {
                            newItem = budgetCtrl.addItem(type, incomeInput.description, incomeInput.value);
                     } else if (type === 'exp') {
                            newItem = budgetCtrl.addItem(type, expensesInput.description, expensesInput.value);
                     }
                     
                     UICtrl.addItemToList(type, newItem); 
                     UICtrl.clearInput(type); 
                     updateBudget();
              }
       };

       var ctrlDeleteItem = function(event) {
              var itemId = event.target.parentNode.parentNode.id;

              if (itemId) {
                     var splitId = itemId.split('-');
                     var type = splitId[0];
                     var id = parseInt(splitId[1]); 

                     budgetCtrl.deleItem(type, id);
                     UICtrl.removeItemFromList(itemId);
                     updateBudget();
              }   
       };

       return { 
              init: function () {
                     setUpEventListeners();
              }
       };

})(budgetController, UIController);

mainController.init(); 



