import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.querySelector("#maize3d");
const host = document.querySelector(".maize-stage");
if (canvas && host && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(4.2, 2.3, 6.7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.HemisphereLight(0xeaf1d8, 0x26351e, 2.0));
    const key = new THREE.DirectionalLight(0xffe5b0, 3.2);
    key.position.set(3.5, 5, 4);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc6d69a, 2.0);
    rim.position.set(-4, 1.5, -3);
    scene.add(rim);
    const fill = new THREE.PointLight(0xf4c875, 42, 12);
    fill.position.set(1, -1, 4);
    scene.add(fill);

    const product = new THREE.Group();
    product.rotation.z = -0.62;
    product.rotation.x = 0.12;
    scene.add(product);

    const huskMat = new THREE.MeshStandardMaterial({ color: 0x47743a, roughness: 0.82, metalness: 0.0, side: THREE.DoubleSide });
    const huskLight = new THREE.MeshStandardMaterial({ color: 0x71934a, roughness: 0.78, side: THREE.DoubleSide });
    function makeLeaf(angle, length, spread, material) {
      const verts = [], uvs = [], indices = [];
      const rows = 34, cols = 12;
      for (let i = 0; i <= rows; i++) {
        const t = i / rows;
        const width = Math.pow(Math.sin(Math.PI * t), 0.8) * 0.42 * spread + 0.012;
        for (let j = 0; j <= cols; j++) {
          const u = (j / cols) * 2 - 1;
          const radial = 0.18 + Math.sin(t * 1.45) * 0.56 + Math.max(0, t - 0.55) * 0.3;
          const y = -1.42 + t * length;
          const x = Math.cos(angle) * (radial + u * width);
          const z = Math.sin(angle) * (radial + u * width);
          const curl = Math.sin(t * Math.PI) * u * 0.12;
          verts.push(x, y, z + curl);
          uvs.push(j / cols, t);
        }
      }
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const a = i * (cols + 1) + j, b = a + cols + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices); geo.computeVertexNormals();
      const leaf = new THREE.Mesh(geo, material);
      leaf.castShadow = true; leaf.receiveShadow = true;
      product.add(leaf);
    }
    makeLeaf(0.2, 2.9, 1.1, huskMat);
    makeLeaf(2.2, 2.6, 0.95, huskLight);
    makeLeaf(4.1, 2.7, 0.9, huskMat);
    makeLeaf(5.4, 2.25, 0.8, huskLight);

    const cobProfile = [
      new THREE.Vector2(0.02, -1.38), new THREE.Vector2(0.16, -1.29),
      new THREE.Vector2(0.27, -0.98), new THREE.Vector2(0.34, -0.45),
      new THREE.Vector2(0.36, 0.1), new THREE.Vector2(0.32, 0.7),
      new THREE.Vector2(0.23, 1.18), new THREE.Vector2(0.06, 1.38)
    ];
    const cob = new THREE.Mesh(new THREE.LatheGeometry(cobProfile, 48), new THREE.MeshStandardMaterial({ color: 0xead19a, roughness: 0.95 }));
    cob.castShadow = true; cob.receiveShadow = true; product.add(cob);

    const kernelGeo = new THREE.SphereGeometry(0.086, 14, 12);
    const kernelMat = new THREE.MeshStandardMaterial({ color: 0xe9b83f, roughness: 0.34, metalness: 0.02 });
    const kernels = new THREE.InstancedMesh(kernelGeo, kernelMat, 16 * 23);
    kernels.castShadow = true; kernels.receiveShadow = true;
    const dummy = new THREE.Object3D();
    let count = 0;
    for (let row = 0; row < 23; row++) {
      const y = -1.17 + row * 0.105;
      const t = (y + 1.38) / 2.76;
      const radius = 0.21 + Math.sin(Math.PI * t) * 0.135;
      for (let col = 0; col < 16; col++) {
        const angle = (col / 16) * Math.PI * 2 + (row % 2) * 0.19;
        dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        dummy.rotation.set(0, -angle, 0);
        dummy.scale.setScalar(0.001);
        dummy.updateMatrix(); kernels.setMatrixAt(count++, dummy.matrix);
      }
    }
    product.add(kernels);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(1.9, 64), new THREE.MeshBasicMaterial({ color: 0x14271b, transparent: true, opacity: 0.16 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.72; floor.scale.set(1.45, 0.52, 1);
    scene.add(floor);

    const grainGeo = new THREE.SphereGeometry(0.065, 12, 10);
    const grainMat = new THREE.MeshStandardMaterial({ color: 0xd9a832, roughness: 0.4 });
    const grains = [];
    for (let i = 0; i < 13; i++) {
      const m = new THREE.Mesh(grainGeo, grainMat);
      const a = i * 2.4, r = 1.15 + (i % 3) * 0.22;
      m.position.set(Math.cos(a) * r, -0.9 + (i % 6) * 0.38, Math.sin(a) * r);
      m.scale.setScalar(0.45 + (i % 3) * 0.18);
      scene.add(m); grains.push({ mesh: m, base: m.position.clone(), phase: i * 0.7 });
    }

    let pointerX = 0, pointerY = 0, scroll = 0;
    host.addEventListener("pointermove", e => {
      const r = host.getBoundingClientRect();
      pointerX = ((e.clientX - r.left) / r.width - 0.5) * 0.22;
      pointerY = ((e.clientY - r.top) / r.height - 0.5) * 0.16;
    });
    window.addEventListener("scroll", () => {
      const r = host.getBoundingClientRect();
      scroll = THREE.MathUtils.clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
    }, { passive: true });

    function resize() {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.x = w < 600 ? 3.6 : 4.2;
      camera.position.z = w < 600 ? 7.4 : 6.7;
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(host);
    resize();

    const start = performance.now();
    function animate(now) {
      requestAnimationFrame(animate);
      const t = (now - start) / 1000;
      const reveal = THREE.MathUtils.smoothstep(t, 0.35, 3.1);
      for (let i = 0; i < kernels.count; i++) {
        const m = new THREE.Matrix4();
        kernels.getMatrixAt(i, m);
        const p = new THREE.Vector3().setFromMatrixPosition(m);
        const s = 0.001 + reveal * 0.98;
        dummy.position.copy(p); dummy.scale.setScalar(s); dummy.updateMatrix();
        kernels.setMatrixAt(i, dummy.matrix);
      }
      kernels.instanceMatrix.needsUpdate = true;
      product.rotation.y = Math.sin(t * 0.24) * 0.18 + pointerX + scroll * 0.34;
      product.rotation.x = 0.12 + Math.sin(t * 0.32) * 0.035 + pointerY;
      product.position.y = Math.sin(t * 0.8) * 0.055;
      grains.forEach(({ mesh, base, phase }) => {
        mesh.position.y = base.y + Math.sin(t * 0.9 + phase) * 0.11;
        mesh.rotation.x = t * 0.35 + phase;
        mesh.rotation.y = t * 0.28 + phase;
      });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  } catch (err) {
    console.warn("3D maize showcase unavailable:", err);
    host?.classList.add("three-fallback");
  }
}
