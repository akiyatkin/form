import { Form } from '/vendor/akiyatkin/form/Form.js'
import { DOM } from '/vendor/akiyatkin/load/DOM.js'
import { Popup } from '/vendor/infrajs/popup/Popup.js'
import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { Controller } from '/vendor/infrajs/controller/src/Controller.js'

DOM.done('load', () => {
	for (let form of document.getElementsByTagName('form')) {
		Form.on('init', form)
	}
})

Form.after('submit', (form, ans) => {
	if (ans.go) {
		Crumb.go(ans.go)
	}
	if (ans.popup) {
		if (ans.result) Popup.success(ans.msg)
		else Popup.error(ans.msg)
	}
})


Form.done('submit', () => {
	Controller.check()
})

Controller.hand('init', async () => {
	//Нельзя продолжать пока не выполнится инициализация
	await import('./init.js')
})
