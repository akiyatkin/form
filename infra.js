import { Form } from '/vendor/akiyatkin/form/Form.js'
import { DOM } from '/vendor/akiyatkin/load/DOM.js'
import { Controller } from '/vendor/infrajs/controller/src/Controller.js'
let imp = async name => import({
	Crumb: '/vendor/infrajs/controller/src/Crumb.js',
	Popup: '/vendor/infrajs/popup/Popup.js'
}[name])

DOM.done('load', () => {
	for (let form of document.getElementsByTagName('form')) {
		if (!form.dataset.layerid) continue
		Form.on('init', form)
	}
})

Form.after('submit', async (form, ans) => {
	if (ans.go) {
		let Crumb = await imp('Crumb')
		Crumb.go(ans.go)
	}
	if (ans.popup) {
		let Popup = await imp('Popup')
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
