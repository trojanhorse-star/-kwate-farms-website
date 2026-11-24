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


    // Additional illustrative product scenes: dairy and harvested grains.
    // These visuals communicate business categories, not a verified live stock list.
    const dairyGroup = new THREE.Group();
    scene.add(dairyGroup);
    const bottleMat = new THREE.MeshPhysicalMaterial({ color: 0xf0eee0, roughness: 0.2, metalness: 0.0, clearcoat: 0.9, clearcoatRoughness: 0.12 });
    const milkMat = new THREE.MeshStandardMaterial({ color: 0xf8f3df, roughness: 0.28 });
    const bottleProfile = [
      new THREE.Vector2(0.02,-1.2),new THREE.Vector2(0.34,-1.2),new THREE.Vector2(0.4,-1.08),
      new THREE.Vector2(0.4,0.45),new THREE.Vector2(0.37,0.62),new THREE.Vector2(0.23,0.82),
      new THREE.Vector2(0.16,0.92),new THREE.Vector2(0.15,1.2),new THREE.Vector2(0.02,1.2)
    ];
    const bottle = new THREE.Mesh(new THREE.LatheGeometry(bottleProfile,48),bottleMat);
    bottle.castShadow=true; bottle.receiveShadow=true; dairyGroup.add(bottle);
    const milkFill = new THREE.Mesh(new THREE.CylinderGeometry(0.335,0.36,1.35,40),milkMat);
    milkFill.position.y=-0.36; dairyGroup.add(milkFill);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.155,0.16,0.28,32),bottleMat);
    neck.position.y=1.18; dairyGroup.add(neck);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.13,32),new THREE.MeshStandardMaterial({color:0x42613d,roughness:0.55}));
    cap.position.y=1.38; dairyGroup.add(cap);
    const labelCanvas=document.createElement("canvas"); labelCanvas.width=512; labelCanvas.height=256;
    const ctx=labelCanvas.getContext("2d");
    ctx.fillStyle="#f1e8d0";ctx.fillRect(0,0,512,256);
    ctx.fillStyle="#24452f";ctx.textAlign="center";ctx.font="bold 42px Georgia";ctx.fillText("KWATE FARMS",256,105);
    ctx.font="26px Arial";ctx.fillText("DAIRY",256,155);
    const labelTex=new THREE.CanvasTexture(labelCanvas);labelTex.colorSpace=THREE.SRGBColorSpace;
    const label=new THREE.Mesh(new THREE.CylinderGeometry(0.405,0.405,0.56,48,1,true),new THREE.MeshStandardMaterial({map:labelTex,roughness:0.7}));
    label.position.y=-0.2; dairyGroup.add(label);

    const grainsGroup = new THREE.Group();
    scene.add(grainsGroup);
    const sackMat = new THREE.MeshStandardMaterial({color:0xb49a6a,roughness:0.98});
    const sackProfile=[new THREE.Vector2(0.03,-1.05),new THREE.Vector2(0.48,-1.05),new THREE.Vector2(0.58,-0.8),new THREE.Vector2(0.62,-0.1),new THREE.Vector2(0.53,0.68),new THREE.Vector2(0.42,0.82),new THREE.Vector2(0.04,0.82)];
    const sack=new THREE.Mesh(new THREE.LatheGeometry(sackProfile,48),sackMat);
    sack.castShadow=true;sack.receiveShadow=true;grainsGroup.add(sack);
    const rimSack=new THREE.Mesh(new THREE.TorusGeometry(0.43,0.075,12,48),new THREE.MeshStandardMaterial({color:0x786343,roughness:1}));
    rimSack.rotation.x=Math.PI/2;rimSack.position.y=0.79;grainsGroup.add(rimSack);
    const seedGeo=new THREE.SphereGeometry(0.075,10,8);
    const seedMats=[0xd8b65f,0xc6a45a,0xe3ca83].map(color=>new THREE.MeshStandardMaterial({color,roughness:0.78}));
    for(let i=0;i<34;i++){
      const seed=new THREE.Mesh(seedGeo,seedMats[i%seedMats.length]);
      const a=i*2.399, r=0.13+((i*7)%13)/100;
      seed.position.set(Math.cos(a)*r,0.86+(i%5)*0.045,Math.sin(a)*r);
      seed.scale.set(1.15,0.72,0.72);seed.rotation.z=a;grainsGroup.add(seed);
    }
    // Groundnut pods as a secondary crop detail beside the grain sack.
    const podMat=new THREE.MeshStandardMaterial({color:0x9a7546,roughness:0.94});
    for(let i=0;i<7;i++){
      const pod=new THREE.Mesh(new THREE.CapsuleGeometry(0.105,0.34,5,10),podMat);
      const a=i*2.4;pod.position.set(Math.cos(a)*0.62,-0.88,Math.sin(a)*0.62);
      pod.rotation.set(0.4,a,0.7);pod.scale.set(0.72,1,0.72);grainsGroup.add(pod);
    }
    dairyGroup.visible=false;
    grainsGroup.visible=false;
    const showcaseGroups=[product,dairyGroup,grainsGroup];
    const showcaseLabels=[
      ["FIELD CROPS","A HARVEST OF POSSIBILITIES"],
      ["DAIRY","A CLOSER LOOK AT DAIRY VALUE"],
      ["GRAINS & SEEDS","FROM HARVEST TO MARKET"]
    ];
    const caption=host.querySelector(".stage-caption");
    const stageCount=host.querySelector(".stage-orbit");

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
      const reveal = THREE.MathUtils.smoothstep(t, 0.35, 3.1);\n      const active = Math.floor(t / 6.5) % showcaseGroups.length;\n      showcaseGroups.forEach((group,index)=>{\n        const target=index===active?1:0;\n        const current=group.userData.fade??(index===0?1:0);\n        group.userData.fade=THREE.MathUtils.damp(current,target,4,1/60);\n        group.visible=group.userData.fade>0.015;\n        group.scale.setScalar(Math.max(0.001,group.userData.fade));\n        if(index!==0){group.rotation.y=t*0.22+(index*0.5);group.position.y=Math.sin(t*0.8+index)*0.045;}\n      });\n      if(caption){caption.querySelector("span").textContent=showcaseLabels[active][0];caption.querySelector("b").textContent=showcaseLabels[active][1];}\n      if(stageCount)stageCount.innerHTML=String(active+1).padStart(2,"0")+' <i>—</i> 03';
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
