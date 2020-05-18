import { Fire } from '/vendor/akiyatkin/load/Fire.js'
import { Session } from '/vendor/infrajs/session/Session.js'

let $ = async name => import({
	Autosave: './Autosave.js',
	Access: '/vendor/infrajs/access/Access.js',
	reCAPTCHA: '/vendor/akiyatkin/recaptcha/reCAPTCHA.js'
}[name])

//import { Access } from '/vendor/infrajs/access/Access.js'
//import { reCAPTCHA } from '/vendor/akiyatkin/recaptcha/reCAPTCHA.js'



let Form = { ...Fire }

Form.before('submit', async form => {
	await Session.async() //Поля должны сохраниться в сессии на сервере
})

Form.hand('init', async form => {
	if (!form.dataset.autosave) return
	let autosave = await $('Autosave')
	Autosave.init(form, form.dataset.autosave)
})


Form.before('init', async form => {
	if (!form.dataset.recaptcha) return
	let recaptcha = await $('reCAPTCHA')
	reCAPTCHA.on('init')
})
Form.before('submit', async form => {
	if (!form.dataset.recaptcha) return
	let recaptcha = await $('reCAPTCHA')
	await reCAPTCHA.tikon('apply', form)
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
	return new Promise( resolve => {
		form.addEventListener('submit', async e => {
			e.preventDefault()
			let ans = await Form.on('submit', form) //Событие 2 раза не генерируется
			resolve(ans)
		})	
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
			let Access = await $('Access')
			if (await Access.debug()) msg += '<hr>' + e + '<hr>' + text
		}
	}
	if	 (!ans) ans = {
		result: 0,
		msg: msg
	}
	return ans
})


window.Form = Form
export {Form}