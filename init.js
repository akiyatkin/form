import { Parsed } from '/vendor/infrajs/controller/src/Parsed.js'
import { Form } from '/vendor/akiyatkin/form/Form.js'
import { Layer } from '/vendor/infrajs/controller/src/Layer.js'
import { Event } from '/vendor/infrajs/event/Event.js'

Parsed.add(layer => { 
	//parsed должен забираться после установки msg config-a
	//После onsubmit слой должен перепарсится
	if (!layer.onsubmit) return 's'
	if (!layer.config || !layer.config.ans) return 's'
	let str = layer.config.ans.msg
	if (!str) str = 's'
	if (layer.config.ans.time) {
		str += layer.config.ans.time
	}
	return str
})


Form.after('submit', async (form, ans) => {
	if (!ans.result) return
	if (!form.dataset.global) return
	let { Global } = await import('/vendor/infrajs/layer-global/Global.js')
	Global.set(form.dataset.global) //Удаляет config.ans у слоёв
})

Form.done('submit', async (form, ans) => {
	if (!ans.result) return;
	if (!form.dataset.goal) return
	let { Goal } = await import('/vendor/akiyatkin/goal/Goal.js')
	Goal.reach(form.dataset.goal);
})

Form.done('submit', async (form, ans) => {
	if (!form.dataset.layerid) return
	let layer = await Layer.get(form.dataset.layerid)
	if (!layer.config) layer.config = { }
	layer.config.ans = ans
})

	
Event.handler('Layer.oncheck', async function (layer) {
	if (!layer['autosavenametpl']) return;
	let { Template } = await import('/vendor/infrajs/template/Template.js')
	layer['autosavename'] = Template.parse([layer['autosavenametpl']], layer);
});