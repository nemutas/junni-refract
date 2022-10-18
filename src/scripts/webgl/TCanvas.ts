import * as THREE from 'three'
import { TCanvasBase } from './TCanvasBase'
import vertexShader from './shader/vertexShader.glsl'
import fragmentShader from './shader/fragmentShader.glsl'
import { Assets, loadAssets } from './assetLoader'
import { resolvePath } from '../utils'
import { gui } from './gui'

export class TCanvas extends TCanvasBase {
	private renderTarget!: THREE.WebGLRenderTarget

	private assets: Assets = {
		image: { path: resolvePath('resources/wlop1.jpg') },
	}

	constructor(parentNode: ParentNode) {
		super(parentNode)

		loadAssets(this.assets).then(() => {
			this.setScene()
			this.setResize()
			this.createModel()
			this.animate(this.update)
		})
	}

	private setScene() {
		const texture = this.assets.image.data as THREE.Texture
		this.scene.background = this.coveredBackgroundTexture(texture)

		this.camera.position.z = 3

		this.renderTarget = new THREE.WebGLRenderTarget(this.size.width, this.size.height, {
			encoding: THREE.sRGBEncoding,
		})

		const controls = this.setOrbitControls()
		controls.enablePan = false
	}

	private setResize() {
		this.resizeCallback = () => {
			const texture = this.assets.image.data as THREE.Texture
			this.coveredBackgroundTexture(texture)

			const box = this.getMesh<THREE.ShaderMaterial>('box')
			box.material.uniforms.u_screenCoord.value.copy(this.calcScreenCoord())
		}
	}

	private calcScreenCoord() {
		const { width, height } = this.size
		return new THREE.Vector2(width * window.devicePixelRatio, height * window.devicePixelRatio)
	}

	private createModel() {
		const boxGeo = new THREE.BoxGeometry()
		boxGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 4))
		boxGeo.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 5.1))
		const boxMat = new THREE.ShaderMaterial({
			uniforms: {
				u_texture: { value: null },
				u_screenCoord: { value: this.calcScreenCoord() },
				u_refractPower: { value: 0.1 },
				u_transparent: { value: 0.2 },
			},
			vertexShader,
			fragmentShader,
		})
		const boxMesh = new THREE.Mesh(boxGeo, boxMat)
		boxMesh.name = 'box'
		this.scene.add(boxMesh)

		gui.add(boxMat.uniforms.u_refractPower, 'value', 0, 1, 0.01).name('refract power')
		gui.add(boxMat.uniforms.u_transparent, 'value', 0, 1, 0.01).name('transparent')
	}

	private getMesh<T extends THREE.Material>(name: string) {
		return this.scene.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, T>
	}

	private update = () => {
		const dt = this.clock.getDelta()
		const box = this.getMesh<THREE.ShaderMaterial>('box')
		box.rotation.y += dt

		box.visible = false

		this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		box.material.uniforms.u_texture.value = this.renderTarget.texture
		this.renderer.setRenderTarget(null)

		box.visible = true
	}

	dispose() {
		super.dispose()
		gui.destroy()
	}
}
