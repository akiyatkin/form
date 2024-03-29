import { Fire } from '/vendor/akiyatkin/load/Fire.js'
import { inViewport } from '/vendor/akiyatkin/load/inViewport.js'

let reCAPTCHA

// Form init, submit

let Form = { ...Fire }

Form.till('init', async form => {
	//await inViewport(form)
})

Form.hand('init', async form => {
	if (!form.dataset.autosave) return
	let { Autosave } = await import('/vendor/akiyatkin/form/Autosave.js')
	Autosave.init(form, form.dataset.autosave)
})

Form.till('submit', async form => {
	if (!form.dataset.recaptcha) return
	reCAPTCHA = (await import('/vendor/akiyatkin/recaptcha/reCAPTCHA.js')).reCAPTCHA
	await reCAPTCHA.fire('apply', form)
})



Form.till('init', form => {
	let cls = (cls) => form.getElementsByClassName(cls)
	for (let btn of cls('submit')) {
		btn.addEventListener('click', ()=>{
			let event = new Event('submit');
			form.dispatchEvent(event);
		})
	}
})
Form.till('init', form => { //before
	form.addEventListener('submit', async e => {
		e.preventDefault()
		Form.puff('submit', form)
	})
})

Form.hand('submit', async form => {
	let ans = false
	if (!form.getAttribute('action')) return ans
	let response = await fetch(form.action, {
		method: 'POST',
		body: new FormData(form)
	})
	let msg = 'Connect Error'
	
	if (response) {
		try {
			ans = await response.clone().json()
		} catch (e) {
			msg = 'Server Error'
			let text = await response.text()
			let { Access } = await import('/vendor/infrajs/access/Access.js')
			if (Access.debug()) msg += '<hr>' + e + '<hr>' + text
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