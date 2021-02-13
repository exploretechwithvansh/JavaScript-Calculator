class VintageCalculator {
	constructor(elem, userConfig) {
		this.dom = {
			el: elem,
		};
		
		const options = {
			mode: 'light',
			classNames: {
				containerOuter: 'vcalc',
				containerInner: 'vcalc__inner',
				topSection: 'vcalc__header',
				title: 'vcalc__header-title',
				subtitle: 'vcalc__header-subtitle',
				sensor: 'vcalc__header-sensor',
				history: 'vcalc__header-history',
				display: 'vcalc__display',
				keyboard: 'vcalc__keyboard',
			},
		};
		
		const keyMap = [
			['7','8','9','÷'],
			['4','5','6','×'],
			['1','2','3','-'],
			['AC','0','=','+'],
		];
		
		if (!userConfig) { userConfig = {} }
		this.config = deepmerge(options, userConfig);
		
		this.keyMap = keyMap;
		
		this.listeners = {
			click: this.click.bind(this),
		}
		
		this.storeValue = '';
		this.lastValue = '';
		this.activeOperator;
	}
	
	init() {
		this.buildDOM();
		this.addEventListeners();
	}
	
	buildDOM() {
		let defaults = {
			tagName: 'DIV',
			innerText: undefined
		}
		
		// Top Section
		this.createElem(defaults.tagName, defaults.innerText, this.config.classNames.containerOuter, this.dom.el);
		this.createElem(defaults.tagName, defaults.innerText, this.config.classNames.containerInner, this.config.classNames.containerOuter);
		this.createElem(defaults.tagName, defaults.innerText, this.config.classNames.topSection, this.config.classNames.containerInner);
		this.createElem(defaults.tagName, 'casio', this.config.classNames.title, this.config.classNames.topSection);
		this.createElem(defaults.tagName, 'calculator', this.config.classNames.subtitle, this.config.classNames.topSection);
		this.createElem(defaults.tagName, defaults.innerText, this.config.classNames.sensor, this.config.classNames.topSection);
		
		for (var i = 0; i < 4; i++) {
			this.createElem('span', defaults.innerText, undefined, this.config.classNames.sensor);
		}
		
		this.createElem(defaults.tagName, defaults.innerText, this.config.classNames.history, this.config.classNames.topSection);
		
		// Dispay
		this.createElem(defaults.tagName, '0', this.config.classNames.display, this.config.classNames.containerInner);
		
		// Keyboard		
		this.createElem(defaults.tagName, defaults.innerText, this.config.classNames.keyboard, this.config.classNames.containerInner);
			
		for (var r = 0; r < this.keyMap.length; r++) {			
			for (var c = 0; c < this.keyMap[r].length; c++) {
				let type = isNaN(this.keyMap[r][c]) ? 'operator' : 'number';
				
				this.createElem(defaults.tagName, this.keyMap[r][c], type, this.config.classNames.keyboard);
			}
		}
		
		this.dom.elements = {
			containerOuter: document.querySelector('.' + this.config.classNames.containerOuter),
			containerInner: document.querySelector('.' + this.config.classNames.containerInner),
			topSection: document.querySelector('.' + this.config.classNames.topSection),
			title: document.querySelector('.' + this.config.classNames.title),
			subtitle: document.querySelector('.' + this.config.classNames.subtitle),
			sensor: document.querySelector('.' + this.config.classNames.sensor),
			history: document.querySelector('.' + this.config.classNames.history),
			display: document.querySelector('.' + this.config.classNames.display),
			keyboard: document.querySelector('.' + this.config.classNames.keyboard),
		};
	};
	
	createElem(tag, innerText, className, appendTo) {
		let newEl = document.createElement(tag), parent;
		
		if (innerText) newEl.innerText = innerText
		if (className) newEl.classList.add(className)
		
		// check if its an object or a class(string)
		typeof appendTo === 'object' ? parent = appendTo : parent = document.querySelector('.' + appendTo);
		
		parent.append(newEl);
	};
	
	addEventListeners() {
		const keys = this.dom.elements.keyboard.querySelectorAll('div'),
			  _this = this;
		
		keys.forEach(function(key) {
			key.addEventListener('click', _this.listeners.click);
		});
		
	};
	
	removeEventListeners() {
		const keys = this.dom.elements.keyboard.querySelectorAll('div'),
			  _this = this;
		
		keys.forEach(function(key) {
			key.removeEventListener('click', _this.listeners.click);
		});
	};
	
	click() {		
		let target = event.target;
		this.printValue(target.classList.value, target);
	};
	
	printValue(type, target) {
		const history = this.dom.elements.history,
			  display = this.dom.elements.display;
		let value = target.innerText;

		if (type === 'number') {
			// remove selected state if exist
			if (this.activeOperator) this.activeOperator.classList.remove('selected');
			
			if (this.storeValue === '' || this.lastValue !== '') {
				//clear lastValue
				this.lastValue = '';
				
				display.innerText = value;
				this.storeValue += value;
			} else {
				display.innerText += value;
				this.storeValue += value;
			}
		} else if (type === 'operator') {
			
			// add selected operator a state excepts equals and clear
			if (!value.match(/AC|\=/)) {
				target.classList.add('selected');
				this.activeOperator = target;
			}
			
			if (this.storeValue !== '' || value === 'AC') {
				
				// store last number to display
				this.lastValue = display.innerText;
				
				// store last display value on history
				if(value !== 'AC') history.innerText = display.innerText;

				// clear display value
				display.innerText = this.lastValue;
				
				// add operator
				switch (value) {
					case '×':
						var multiply = '*';
						history.innerText += value;
						this.storeValue += multiply;
						break;
					case '=':						
						history.innerText = this.storeValue;
						display.innerText = this.calc(this.storeValue);
						break;
					case '÷':
						var divide = '/';
						history.innerText += value;
						this.storeValue += divide;
						break;
					case 'AC':
						this.allClear();
						break;
					default:
						history.innerText += value;
						this.storeValue += value;
						break;
				}
				
			} 

		}
	}
	
	allClear() {		
		// remove selected state if exist
		if (this.activeOperator) this.activeOperator.classList.remove('selected');
		
		this.dom.elements.history.innerText = '';
		this.dom.elements.display.innerText = '0';
		this.storeValue = '';
		
	};
	
	calc(value) {
		return eval(value);
	};
	
	destroy() {
		this.removeEventListeners();
		this.dom.el.removeChild(calc.dom.elements.containerOuter);
	};
};

// Init
const element = document.querySelector('.calc');

var calc = new VintageCalculator(element);
calc.init();