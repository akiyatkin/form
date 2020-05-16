import { Fire } from '/vendor/akiyatkin/load/Fire.js'
import { Popup } from '/vendor/infrajs/popup/Popup.js'
import { Access } from '/vendor/infrajs/access/Access.js'
import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { reCAPTCHA } from '/vendor/akiyatkin/recaptcha/reCAPTCHA.js'
import { Autosave } from './Autosave.js'
import { DOM } from '/vendor/akiyatkin/load/DOM.js'
import { Parsed } from '/vendor/infrajs/controller/src/Parsed.js'
import { Controller } from '/vendor/infrajs/controller/src/Controller.js'
import { Global } from '/vendor/infrajs/layer-global/Global.js'

//Ответ обработчика находится в layer.config.ans (обрабатываются параметры в ответе result, msg
//Проверки перед отправки формы не предусмотрено. Всё проверяет сервер и отвечает в msg.
//При изменении msg слой перепарсивается


/*
	init
	submit

	before
	hand
	after 


*/

let Form = { ...Fire }

Form.before('init', form => {
	if (!form.dataset.autosave) return
	Autosave.init(form, form.dataset.autosave)
})

Form.before('init', form => {
	if (!form.dataset.recaptcha) return
	reCAPTCHA.on('init')
})
Form.before('submit', async form => {
	await reCAPTCHA.tikon('apply', form)
})


Form.before('init', form => {
	let cls = (cls) => form.getElementsByClassName(cls)
	for (let btn of cls('submit')) {
		btn.addEventListener('click', form.submit)
	}
})

Form.hand('init', form => {
	return new Promise( resolve => {
		form.addEventListener('submit', async e => {
			e.preventDefault()
			let ans = await Form.on('submit', form) //Событие 2 раза не генерируется
			resolve(ans)
		})	
	})
})



Form.before('submit', async form => {
	await Session.async() //Поля должны сохраниться в сессии на сервере
})
Form.done('submit', () => {
	Controller.check()
})

Form.hand('submit', async form => {
	let response = await fetch(form.action, {
		method: 'POST',
		body: new FormData(form)
	})
	let msg = 'Connect Error'
	let ans = false
	if (response) {
		try {
			ans = await response.json()
		} catch (e) {
			msg = 'Server Error'
			let text = await response.text()
			if (await Access.debug()) msg += '<hr>' + e + '<hr>' + text
		}
	}
	if	 (!ans) ans = {
		result: 0,
		msg: msg
	}
	return ans
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

Parsed.add(layer => { 
	//parsed должен забираться после установки msg config-a
	//После onsubmit слой должен перепарсится
	if (!layer.onsubmit) return ''
	if (!layer.config || !layer.config.ans) return ''
	let str = layer.config.ans.msg
	if (!str) str = ''
	if (layer.config.ans.time) {
		str += layer.config.ans.time
	}
	return str
})

Form.done('submit', async (form, ans) => {
	if (!form.dataset.layerid) return
	await Controller.wait('check')
	let layer = Controller.ids[form.dataset.layerid]
	if (!layer.config) layer.config = {}
	layer.config.ans = ans
})


Form.after('submit', form => {
	if (!form.dataset.global) return
	Global.set(form.dataset.global) //Удаляет config.ans у слоёв
})

window.Form = Form
export {Form}