import { Form } from '/vendor/akiyatkin/form/Form.js'
import { DOM } from '/vendor/akiyatkin/load/DOM.js'

DOM.done('load', () => {
	for (let form of document.getElementsByTagName('form')) {
		if (!form.classList.contains('form')) continue
		Form.fire('init', form)
	}
})
DOM.once('check', async () => {
	//Нельзя продолжать пока не выполнится инициализация
	await import('./init.js')
})



Form.done('submit', async (form, ans) => {
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
Form.done('submit', async (form, ans) => {
	await DOM.emit('check')
})
