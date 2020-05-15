
import { Fire } from '/vendor/akiyatkin/load/Fire.js'
import { Popup } from '/vendor/infrajs/popup/Popup.js'
import { Access } from '/vendor/infrajs/access/Access.js'
import { Crumb } from '/vendor/infrajs/controller/src/Crumb.js'
import { Controller } from '/vendor/infrajs/controller/src/Controller.js'
import { Layer } from '/vendor/infrajs/controller/src/Layer.js'
import { Global } from '/vendor/infrajs/layer-global/Global.js'
//Ответ обработчика находится в layer.config.ans (обрабатываются параметры в ответе result, msg
//Проверки перед отправки формы не предусмотрено. Всё проверяет сервер и отвечает в msg.
//При изменении msg слой перепарсивается

let handlock = new WeakSet()
let clicklock = new Set()
let Form = {
	on: async (...params) => await Fire.on(Form, ...params),
	tikon: async (...params) => await Fire.tikon(Form, ...params),
	hand: async (...params) => await Fire.hand(Form, ...params),
	wait: async (...params) => await Fire.wait(Form, ...params)
}

Form.init = (form, layerid, callback) => {
	let resolve
	let promise = new Promise(r => resolve = r)
	if (handlock.has(form)) return
	handlock.add(form)

	let cls = (cls) => form.getElementsByClassName(cls)

	for (let btn of cls('submit')) {
		btn.addEventListener('click', form.submit)
	}
	
	//Event, Crumb, Controller
	form.addEventListener('submit', async e => {
		e.preventDefault()
		if (clicklock.has(layerid)) return false //Защита от двойной отправки
		clicklock.add(layerid)
		await Submit.tikon('start', form) //Для reCAPTCHA и для autosave
		
		setTimeout(async () => { //autosave должен примениться
			let ans = await Submit.post(form)
			Controller.check()
			Layer.hand('init', async layer => {
				if (layer.id != layerid) return
				if (!layer.config) layer.config = {}
				layer.config.ans = ans

				if (layer.global) {
					Global.set(layer.global); //Удаляет config.ans у слоёв
				}
				await Session.async()
				
				clicklock.delete(layerid)
				resolve(layer)
				form.ans = ans
				await Submit.tikon('end', layer) //Для Goal
				if (ans.go) {
					Crumb.go(ans.go)
				}
				if (ans.popup) {
					if (ans.result) Popup.success(ans.msg)
					else Popup.error(ans.msg)
				}
			})
		}, 200);
	})
	return promise
}
Form.post = async form => {
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
}
window.Form = Form
export {Form}