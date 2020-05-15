import { CDN } from '/vendor/akiyatkin/load/CDN.js'
import { Session } from '/vendor/infrajs/session/Session.js'
//Скрипт. Точка это разделитель. Могут проблемы когда имя свойства файл расширением,
//autosavename - путь где сохраняются данные,
//
//Атрибуты 
//autosave="0" не использовать автосохранение для данного слоя
//autosavebreak="1" позволять у поля сбрасывать автососхранение

let Autosave = {
	getInps: function (div) {
		return $('#' + div).find('select, .autosaveblock, [type=search], [type=number], [type=tel], [type=email], [type=password], [type=text], [type=radio], [type=checkbox], textarea').filter('[autosave!=0]').filter('[name!=""]');
	},
	/**
	* слой у которого нужно очистить весь autosave, например после отправки формы на сервер, нужно сбросить сохранённые в инпутах данные
	* exc массив свойств которые очищать не нужно и нужно сохранить.. 
	*/
	clear: function (layer) {//Если autosave у двух слоёв одинаковый нельзя нарушать связь
		if (!layer.autosavename) return;
		//layer.autosave={};
		Session.set(layer.autosavename);
	},
	get: function (autosavename, name, def) { //blinds
		if (!autosavename) return def;
		if (!name) name = '';
		var val = Session.get(autosavename + '.' + name, def);
		return val;
	},
	logout: function () {//нет возможности востановить значения по умолчанию указанные в слоях.
		Session.logout();
		location.href = location.href;//Чтобы сбросить autosave в слоях
	},
	set: function (autosavename, name, val) {//skoroskidka, rte.layer.js
		Session.set(autosavename + '.' + name, val);
		//var right=infra.seq.right(name);
		//layer.autosave=infra.seq.set(layer.autosave,right,val);
	},
	//-----------
	loadAll: async (autosavename, div) => {
		await CDN.load('jquery')
		var inps = Autosave.getInps(div).filter('[autosave]');
		inps.each(function () {
			var inp = $(this);
			var name = inp.attr('name');
			var val = Autosave.getVal(inp);
			var valsave = Autosave.get(autosavename, name);
			if (valsave !== undefined) { //Значения по умолчанию подставляемые браузером
				Autosave.setVal(inp, valsave);
				Autosave.bracket(inp, true);
				inp.change();
			}
		});

	},
	/*saveAll: async function (autosavename, div) {
		if (!autosavename) return;
		await CDN.load('jquery')
		var inps = Autosave.getInps(div).filter('[autosave]');

		inps.each(function () {
			var inp = $(this);
			var name = inp.attr('name');
			if (!name) return;
			//this.removeAttribute('notautosaved');//должно быть отдельное событие которое при малейшем измееннии поля ввода будет удалять это свойство //Если свойства этого нет, то сохранять ничего не нужно
			var val = Autosave.getVal(inp);
			var nowval = Autosave.get(layer.autosavename, name);
			if (!nowval) nowval = '';
			if (val == nowval) return;
			Autosave.bracket(inp, true);
			Autosave.set(layer.autosavename, name, val);
		});
	},*/
	getVal: function (inp) {
		inp = $(inp);
		if (inp.attr('type') == 'checkbox') {
			var val = inp.is(':checked');
		} else if (inp.is('radio')) {
			var val = inp.is(':checked');
		} else if (inp.is('select')) {
			var val = inp.find('option:selected').val();
		} else if (inp.hasClass('autosaveblock')) {
			//console.error('AUTOSAVE: Нельзя считывать значение из .autosaveblock');
			//val = 'autosaveblock error';
			val = $(inp).text();
		} else {
			var val = inp.val();
		}
		return val;
	},
	setVal: function (inp, valsave) {
		inp = $(inp);
		if (inp.attr('type') == 'checkbox') {
			inp.attr('checked', valsave);
		} else if (inp.attr('type') == 'radio') {
			var sel = inp.filter('[value="' + valsave + '"]');
			if (sel.length) {
				inp.attr('checked', true);
			}
		} else if (inp.is('select')) {
			//Для работы нужно явно указывать у option атрибут value
			var sel = inp.find('option[value="' + valsave + '"]');
			if (!sel.length) {
				sel = inp.find('option:contains("' + valsave + '")');
			}
			if (sel.length) {
				inp.find('option').removeAttr('selected');
			}
			sel.attr('selected', 'selected');
		} else if (inp.hasClass('autosaveblock')) {
			inp.text(valsave);
		} else {
			inp.val(valsave);
		}
	},
	bracket: function (inp, is) {
		if (!is) {
			$(inp).prevAll('.autosavebreak:first').css('display', 'none');
		} else {
			$(inp).prevAll('.autosavebreak:first').css('display', '');
		}
	},
	fireEvent: function (element, event) {
		if (document.createEventObject) {
			// dispatch for IE
			var evt = document.createEventObject();
			return element.fireEvent('on' + event, evt)
		} else {
			// dispatch for others
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(event, true, true); // event type,bubbling,cancelable
			return !element.dispatchEvent(evt);
		}
	},
	init: async function (autosavename, div) {
		await CDN.load('jquery')
		var inps = Autosave.getInps(div).not('[autosave]').attr('autosave', 1);//Берём input тольо не обработанные
	
		inps.each(function () {
			var inp = this;
			var html = '<div class="autosavebreak" title="Отменить изменения" style="display:none; position:absolute; width:9px; height:3px; cursor:pointer; background-color:gray;"onmouseout="this.style.backgroundColor=\'gray\'" onmouseover="this.style.backgroundColor=\'red\'"></div>';
			if (inp.getAttribute('autosavebreak')) {
				inp.removeAttribute('autosavebreak');
				$(inp).before(html);
				var def = Autosave.getVal(inp);
				$(inp).prevAll('.autosavebreak:first').click(function () {
					Autosave.setVal(inp, def);
					//$(inp).change();//Применится для визуального редактора
					Autosave.fireEvent(inp, 'change');
					Autosave.set(autosavename, inp.name, undefined);//В сессии установится null 
					Autosave.bracket(inp, false);//Скрываем пипку сбороса сохранённого
				});
			}
		});
		//Функция сохраняет все значение, а не только того элемента на ком она сработала
	
		Autosave.loadAll(autosavename, div);//Востанавливаем то что есть в autosave, При установки нового занчения срабатывает change
		//change может программно вызываться у множества элементов. это приводит к тормозам.. нужно объединять
		inps.change(function () {//Всё на change.. при авто изменении нужно вызывать событие change
			//Autosave.saveAll(layer);
			var inp = $(this);
			var name = inp.attr('name');//getInps проверяет чтобы у всех были name
			//this.removeAttribute('notautosaved');//должно быть отдельное событие которое при малейшем измееннии поля ввода будет удалять это свойство //Если свойства этого нет, то сохранять ничего не нужно
	
			var val = Autosave.getVal(inp);
			//var nowval=Autosave.get(layer.autosavename,name);
			//if(!nowval)nowval='';
			//if(val===nowval)return;
			Autosave.bracket(inp, true);
			Autosave.set(autosavename, name, val);
		});//Подписались на события inputов onchange
	}
};


window.Autosave = Autosave;//Это нужно из за метода clear который может вызываться кем угодно. и localSave

export {Autosave}