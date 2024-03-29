import { Parsed } from '/vendor/infrajs/controller/src/Parsed.js'
import { Form } from '/vendor/akiyatkin/form/Form.js'
import { Event } from '/vendor/infrajs/event/Event.js'
let Layer, Template, Global, Goal
Parsed.add(layer => { 
	//parsed должен забираться после установки msg config-a
	//После onsubmit слой должен перепарсится
	//if (!layer.onsubmit) return 's'
	if (!layer.config || !layer.config.ans) return ''
	let str = layer.config.ans.msg
	if (!str) str = 's'
	if (layer.config.ans.time) {
		str += layer.config.ans.time
	}
	str += layer.config.ans.result ? '1':'0'
	
	return str
})


Form.after('submit', async (form, ans) => {
	if (!ans.result) return
	if (!form.dataset.global) return
	let { Global } = await import('/vendor/infrajs/layer-global/Global.js')
	Global.set(form.dataset.global) //Удаляет config.ans у слоёв
})

Form.done('submit', async (form, ans) => {
	if (!form.dataset.goal) return
	const { Goal } = await import('/vendor/akiyatkin/goal/Goal.js')
	if (!ans.result) {
		Goal.reach(form.dataset.goal + '-fail')
	} else {
		Goal.reach(form.dataset.goal)
	}
	
})

Form.done('submit', async (form, ans) => {
	if (!form.dataset.layerid) return
	let Layer = (await import('/vendor/infrajs/controller/src/Layer.js')).Layer
	let layer = await Layer.get(form.dataset.layerid)
	if (!layer.config) layer.config = { }
	layer.config.ans = ans
})

	
Event.handler('Layer.oncheck', async function (layer) {
	if (!layer['autosavenametpl']) return;
	let { Template } = await import('/vendor/infrajs/template/Template.js')
	layer['autosavename'] = Template.parse([layer['autosavenametpl']], layer);
});