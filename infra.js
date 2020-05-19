import { Form } from '/vendor/akiyatkin/form/Form.js'
import { DOM } from '/vendor/akiyatkin/load/DOM.js'
import { Controller } from '/vendor/infrajs/controller/src/Controller.js'

DOM.done('load', href => {
	for (let form of document.getElementsByTagName('form')) {
		if (!form.classList.contains('form')) continue
		Form.on('init', form)
	}
})

Form.done('submit', async (form, ans) => {
	Controller.check()
	await Controller.wait('init')
	if (ans.go) {
		let { Crumb } = await import('/vendor/infrajs/controller/src/Crumb.js')
		Crumb.go(ans.go)
	}
	if (ans.popup) {
		let { Popup } = await import('/vendor/infrajs/popup/Popup.js')
		if (ans.result) await Popup.success(ans.msg)
		else await Popup.error(ans.msg)
	}
})


Controller.hand('init', async () => {
	//Нельзя продолжать пока не выполнится инициализация
	await import('./init.js')
})
