import { Event } from '/vendor/infrajs/event/Event.js'
import { CDN } from '/vendor/akiyatkin/load/CDN.js'

let Autofocus = {}
//autofocus:(bool),//Выставлять фокус на первый пустой input в слое
let autofocus_moveCaretToEnd = function (inp) {
	try {
		if (inp.createTextRange) {
			var r = inp.createTextRange();
			r.collapse(false);
			r.select();
		} else if (inp.selectionStart) {
			var end = inp.value.length;
			inp.setSelectionRange(end, end);
			inp.focus();
		} else if (typeof (inp.selectionStart) == "number") {
			inp.selectionStart = inp.selectionEnd = inp.value.length;
		}
	} catch (e) { }
}
let autofocus = async function (layer) {//onshow
	await CDN.on('load','jquery')
	if (typeof (layer) == 'string') {
		var div = $(layer);
		var layer = {};
	} else {
		if (!layer.autofocus) return;
		var div = $('#' + layer.div);
		div.find('input, textarea').focus(function () {
			var inp = $(this);
			layer.autofocuswas = inp.attr('name');
		});
	}

	if (layer.autofocuswas) {
		var inp = div.find('[name="' + layer.autofocuswas + '"]');
	} else {
		var inp = $('[autofocus]:first');
		if (!inp.length) {
			var inp = div.find('input:first[value=""][type=text]'); //На первый пустой инпут
			if (!inp.length) {
				var inp = div.find('input:first[value=""][type=number]'); //На первый пустой инпут
			} else {

			}
			if (!inp.length) {
				var inp = div.find('input:first[type=text]');
			}
			if (!inp.length) {
				var inp = div.find('input:first[type=number]');
			}
		}
	}
	//inp.prop('autofocus',true);
	inp.focus();
	if (inp.length) {
		autofocus_moveCaretToEnd(inp.get(0));
	}
}
let autofocussave = async function (layer) {//oncheck
	//autofocus
	if (!layer.autofocus) return;
	if (!layer.showed) return;
	await CDN.on('load','jquery')
	var div = $('#' + layer.div);
	var inp = div.find('input:focus');
	if (!inp.length) return;
	layer.autofocuswas = inp.attr('name');//Если происходит асинхронный ответ и тп...
}

Autofocus.save = autofocussave
Autofocus.load = autofocus


/*Event.handler('Layer.oncheck', function (layer) {
	autofocussave(layer);
});
Event.handler('Layer.onshow', function (layer) {
	autofocus(layer);
});*/


export {Autofocus}