import { TCanvas } from './webgl/TCanvas'

class App {
	private canvas: TCanvas

	constructor() {
		this.canvas = new TCanvas(document.body)
	}

	dispose() {
		this.canvas.dispose()
	}
}

const app = new App()
window.addEventListener('beforeunload', () => {
	app.dispose()
})
