import { Fire } from '/vendor/akiyatkin/load/Fire.js'
import { Session } from '/vendor/infrajs/session/Session.js'
let reCAPTCHA, Autosave

// Form init, submit, check

let Form = { ...Fire }

Form.once('init', async () => {
	Autosave = (await import('./Autosave.js')).Autosave
})
Form.once('submit', async () => {
	reCAPTCHA = (await import('/vendor/akiyatkin/recaptcha/reCAPTCHA.js')).reCAPTCHA
})


Form.before('submit', async form => {
	await Session.async() //Поля должны сохраниться в сессии на сервере
})

Form.hand('init', async form => {
	if (!form.dataset.autosave) return
	
	Autosave.init(form, form.dataset.autosave)
})

Form.before('submit', async form => {
	if (!form.dataset.recaptcha) return
	await reCAPTCHA.fire('apply', form)
})



Form.before('init', form => {
	let cls = (cls) => form.getElementsByClassName(cls)
	for (let btn of cls('submit')) {
		btn.addEventListener('click', ()=>{
			let event = new Event('submit');
			form.dispatchEvent(event);
		})
	}
})
Form.hand('init', form => {
	form.addEventListener('submit', async e => {
		e.preventDefault()
		Form.puff('submit', form)
	})
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
			let { Access } = import('/vendor/infrajs/access/Access.js')
			if (await Access.debug()) msg += '<hr>' + e + '<hr>' + text
		}
	}
	if	 (!ans) ans = {
		result: 0,
		msg: msg
	}
	return ans
})

Form.done('submit', async (form, ans) => {
	Form.emit('check', form)
})

window.Form = Form
export {Form}