import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface DroneVisualizationProps {
  isSimulating: boolean
  dataMode: 'MOCK' | 'SIMULATOR' | 'REALTIME'
}

export const DroneVisualization = ({ isSimulating, dataMode }: DroneVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const droneRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null)
  const backgroundMeshRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Main Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Spatial meshing data
    let treePositions: {x: number, z: number}[] = []

    // Sky texture
    const createSkyTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')!
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 512)
      gradient.addColorStop(0, '#87CEEB')
      gradient.addColorStop(0.7, '#B0E0E6')
      gradient.addColorStop(1, '#E0F6FF')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 512, 512)
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      for (let i = 0; i < 50; i++) {
        ctx.beginPath()
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 30 + 10, 0, Math.PI * 2)
        ctx.fill()
      }
      
      return new THREE.CanvasTexture(canvas)
    }
    
    // Set background based on mode
    if (dataMode === 'REALTIME') {
      // For REALTIME, we'll set the video texture as background later
      scene.background = null
    } else {
      scene.background = createSkyTexture()
    }
    
    scene.fog = new THREE.Fog(0x87CEEB, 300, 500)

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(50, 40, 60)
    camera.lookAt(0, 15, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(100, 150, 100)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 4096
    directionalLight.shadow.mapSize.height = 4096
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.camera.left = -150
    directionalLight.shadow.camera.right = 150
    directionalLight.shadow.camera.top = 150
    directionalLight.shadow.camera.bottom = -150
    scene.add(directionalLight)

    // Create background sphere for full 360 environment (only for SIMULATOR mode)
    if (dataMode !== 'REALTIME') {
      const bgGeometry = new THREE.SphereGeometry(1000, 32, 32)
      const bgMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0x000000 })
      const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)
      scene.add(bgMesh)
      backgroundMeshRef.current = bgMesh
    }

    // Setup camera video stream for REALTIME mode
    if (dataMode === 'REALTIME') {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: 'user' } // prefer front camera
          }
        })
        .then((stream) => {
          if (!videoRef.current) {
            const video = document.createElement('video')
            video.srcObject = stream
            video.play()
            video.style.display = 'none'
            videoRef.current = video

            if (containerRef.current) {
              containerRef.current.appendChild(video)
            }

            // Create 360-degree equirectangular sphere with camera feed
            const sphereGeometry = new THREE.SphereGeometry(500, 64, 32)
            const sphereMaterial = new THREE.MeshBasicMaterial({
              map: videoTexture,
              side: THREE.BackSide
            })
            const envSphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
            scene.add(envSphere)
          }
        })
        .catch((err) => {
          // attempt without facingMode
          navigator.mediaDevices
            .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
            .then((stream) => {
              if (!videoRef.current) {
                const video = document.createElement('video')
                video.srcObject = stream
                video.play()
                video.style.display = 'none'
                videoRef.current = video
                if (containerRef.current) {
                  containerRef.current.appendChild(video)
                }
                const videoTexture = new THREE.VideoTexture(video)
                videoTexture.flipY = false
                // Create 360-degree equirectangular sphere with camera feed
                const sphereGeometry = new THREE.SphereGeometry(500, 64, 32)
                const sphereMaterial = new THREE.MeshBasicMaterial({
                  map: videoTexture,
                  side: THREE.BackSide
                })
                const envSphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
                scene.add(envSphere)
              }
            })
            .catch((err2) => {
              // Use black background instead of blue when camera fails
              scene.background = new THREE.Color(0x000000)
            })
        })
    }

    // Only add synthetic environment for non-REALTIME modes (SIMULATOR, MOCK)
    if (dataMode !== 'REALTIME') {
      // Add synthetic environment meshes for meshing and collision
      const groundGeometry = new THREE.PlaneGeometry(400, 400)
      const groundCanvas = document.createElement('canvas')
      groundCanvas.width = 512
      groundCanvas.height = 512
      const ctx2 = groundCanvas.getContext('2d')!
      
      ctx2.fillStyle = '#2d5016'
      ctx2.fillRect(0, 0, 512, 512)
      
      for (let i = 0; i < 1000; i++) {
        ctx2.fillStyle = `rgba(45, 80, 22, ${Math.random() * 0.3 + 0.7})`
        ctx2.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 20, Math.random() * 20)
      }
      
      const groundTexture = new THREE.CanvasTexture(groundCanvas)
      groundTexture.repeat.set(4, 4)
      groundTexture.wrapS = THREE.RepeatWrapping
      groundTexture.wrapT = THREE.RepeatWrapping
      
      const groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture })
      const ground = new THREE.Mesh(groundGeometry, groundMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      scene.add(ground)

      // Add spatial meshing grid for occlusion visualization
      const spatialGrid = new THREE.GridHelper(400, 40, 0x008800, 0x004400)
      spatialGrid.position.y = 0.1
      scene.add(spatialGrid)

      // Add trees for spatial meshing
      treePositions = []
      const createTree = (x: number, z: number) => {
        treePositions.push({x, z})
        const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 8, 8)
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 })
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
        trunk.position.set(x, 4, z)
        trunk.castShadow = true
        trunk.receiveShadow = true
        scene.add(trunk)

        const foliageGeometry = new THREE.SphereGeometry(6, 8, 8)
        const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 })
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial)
        foliage.position.set(x, 12, z)
        foliage.castShadow = true
        foliage.receiveShadow = true
        scene.add(foliage)
      }

      for (let i = 0; i < 15; i++) {
        const x = (Math.random() - 0.5) * 300
        const z = (Math.random() - 0.5) * 300
        createTree(x, z)
      }
    } else {
      // REALTIME mode: Use ONLY the real camera environment
      // Empty tree positions for collision detection fallback
      treePositions = []
    }

    // Create realistic drone - larger size and silver/black colors
    const droneGroup = new THREE.Group()
    droneRef.current = droneGroup

    // Scale up the entire drone
    droneGroup.scale.set(2, 2, 2)

    // Main body - more realistic shape (hexagonal/octagonal)
    const bodyGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.8, 8)
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2c2c2c, // Dark gray/black
      shininess: 100,
      specular: 0x444444
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.castShadow = true
    body.receiveShadow = true
    droneGroup.add(body)

    // Top plate - silver
    const topPlateGeometry = new THREE.CylinderGeometry(1.9, 1.9, 0.1, 8)
    const topPlateMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xc0c0c0, // Silver
      shininess: 200,
      specular: 0xffffff
    })
    const topPlate = new THREE.Mesh(topPlateGeometry, topPlateMaterial)
    topPlate.position.y = 0.35
    topPlate.castShadow = true
    droneGroup.add(topPlate)

    // Bottom plate - silver
    const bottomPlateGeometry = new THREE.CylinderGeometry(1.9, 1.9, 0.1, 8)
    const bottomPlateMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xc0c0c0, // Silver
      shininess: 200,
      specular: 0xffffff
    })
    const bottomPlate = new THREE.Mesh(bottomPlateGeometry, bottomPlateMaterial)
    bottomPlate.position.y = -0.35
    bottomPlate.castShadow = true
    droneGroup.add(bottomPlate)

    // Landing gear - black carbon fiber look
    const legData = [
      { pos: [1.2, -0.6, 1.2], angle: Math.PI/4 },
      { pos: [-1.2, -0.6, 1.2], angle: 3*Math.PI/4 },
      { pos: [1.2, -0.6, -1.2], angle: -Math.PI/4 },
      { pos: [-1.2, -0.6, -1.2], angle: -3*Math.PI/4 },
    ]

    legData.forEach((leg) => {
      const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8)
      const legMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a, // Very dark gray/black
        shininess: 50
      })
      const legMesh = new THREE.Mesh(legGeometry, legMaterial)
      legMesh.position.set(leg.pos[0], leg.pos[1], leg.pos[2])
      legMesh.castShadow = true
      droneGroup.add(legMesh)

      // Foot pad
      const footGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8)
      const footMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
      const foot = new THREE.Mesh(footGeometry, footMaterial)
      foot.position.set(leg.pos[0], leg.pos[2] < 0 ? -0.9 : -0.85, leg.pos[2])
      foot.castShadow = true
      droneGroup.add(foot)
    })

    // Camera mount - more realistic design
    const cameraBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8)
    const cameraBaseMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a })
    const cameraBase = new THREE.Mesh(cameraBaseGeometry, cameraBaseMaterial)
    cameraBase.position.y = -0.6
    cameraBase.castShadow = true
    droneGroup.add(cameraBase)

    // Camera lens
    const lensGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16)
    const lensMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.8
    })
    const lens = new THREE.Mesh(lensGeometry, lensMaterial)
    lens.position.y = -0.65
    lens.castShadow = true
    droneGroup.add(lens)

    // Gimbal arms
    const gimbalArmGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.3)
    const gimbalArmMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 })
    const gimbalArm1 = new THREE.Mesh(gimbalArmGeometry, gimbalArmMaterial)
    gimbalArm1.position.set(0.1, -0.55, 0)
    gimbalArm1.castShadow = true
    droneGroup.add(gimbalArm1)

    const gimbalArm2 = new THREE.Mesh(gimbalArmGeometry, gimbalArmMaterial)
    gimbalArm2.position.set(-0.1, -0.55, 0)
    gimbalArm2.castShadow = true
    droneGroup.add(gimbalArm2)

    // Create 4 arms with propellers - more realistic design
    const armData = [
      { pos: [2.2, 0.4, 2.2], color: 0x333333 }, // All black/gray
      { pos: [-2.2, 0.4, 2.2], color: 0x333333 },
      { pos: [2.2, 0.4, -2.2], color: 0x333333 },
      { pos: [-2.2, 0.4, -2.2], color: 0x333333 },
    ]

    const propellerGroupsRef: THREE.Group[] = []

    armData.forEach((arm, index) => {
      // Arm - carbon fiber look
      const armGeometry = new THREE.BoxGeometry(0.15, 0.15, 3.0)
      const armMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a1a,
        shininess: 30
      })
      const armMesh = new THREE.Mesh(armGeometry, armMaterial)
      armMesh.position.set(arm.pos[0], arm.pos[1], arm.pos[2])
      armMesh.castShadow = true
      droneGroup.add(armMesh)

      // Motor housing - silver
      const motorGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16)
      const motorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xc0c0c0,
        shininess: 150,
        specular: 0xffffff
      })
      const motor = new THREE.Mesh(motorGeometry, motorMaterial)
      motor.position.set(arm.pos[0], arm.pos[1] + 0.3, arm.pos[2])
      motor.castShadow = true
      droneGroup.add(motor)

      const propellerGroup = new THREE.Group()
      propellerGroup.position.set(arm.pos[0], arm.pos[1] + 0.6, arm.pos[2])

      // Propeller blades - more realistic
      const propGeometry = new THREE.BoxGeometry(6.0, 0.08, 0.4)
      const propMaterial = new THREE.MeshPhongMaterial({
        color: arm.color,
        emissive: arm.color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.9
      })

      for (let j = 0; j < 2; j++) {
        const prop = new THREE.Mesh(propGeometry, propMaterial)
        prop.rotation.z = (j * Math.PI) / 2
        prop.castShadow = true
        propellerGroup.add(prop)
      }

      droneGroup.add(propellerGroup)
      propellerGroupsRef.push(propellerGroup)
    })

    droneGroup.position.set(0, 20, 0)
    scene.add(droneGroup)

    // Animation parameters - 6DOF control (3 translation + 3 rotation axes)
    let time = 0
    const controls = { forward: 0, right: 0, up: 0, yaw: 0, pitch: 0, roll: 0 }

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': controls.forward = 1; break
        case 's': controls.forward = -1; break
        case 'a': controls.right = -1; break
        case 'd': controls.right = 1; break
        case 'arrowup': controls.up = 1; break
        case 'arrowdown': controls.up = -1; break
        case 'q': controls.yaw = 1; break
        case 'e': controls.yaw = -1; break
        case 'r': controls.pitch = 1; break
        case 'f': controls.pitch = -1; break
        case 'x': controls.roll = 1; break
        case 'c': controls.roll = -1; break
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 's': controls.forward = 0; break
        case 'a': case 'd': controls.right = 0; break
        case 'arrowup': case 'arrowdown': controls.up = 0; break
        case 'q': case 'e': controls.yaw = 0; break
        case 'r': case 'f': controls.pitch = 0; break
        case 'x': case 'c': controls.roll = 0; break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      if ((isSimulating || dataMode === 'REALTIME') && droneRef.current) {
        time += 0.01
        const speed = 0.5
        // orientation variables stored on drone object
        const drone = droneRef.current!
        if (dataMode === 'REALTIME') {
          // apply full 6DOF rotation (yaw/pitch/roll)
          const rotSpeed = 0.02
          drone.rotation.y += controls.yaw * rotSpeed
          drone.rotation.x += controls.pitch * rotSpeed
          drone.rotation.z += controls.roll * rotSpeed
          
          // compute movement relative to orientation (6DOF translation)
          const forwardVec = new THREE.Vector3(0, 0, -1)
            .applyEuler(drone.rotation)
            .multiplyScalar(controls.forward * speed)
          const rightVec = new THREE.Vector3(1, 0, 0)
            .applyEuler(drone.rotation)
            .multiplyScalar(controls.right * speed)
          const upVec = new THREE.Vector3(0, 1, 0)
            .applyEuler(drone.rotation)
            .multiplyScalar(controls.up * speed)

          // Calculate new position
          const newPosition = drone.position.clone().add(forwardVec).add(rightVec).add(upVec)

          // Basic collision detection
          // Ground collision
          if (newPosition.y < 5) { // Keep drone above ground
            newPosition.y = 5
          }
          // Simple boundary limits
          const maxDistance = 200
          if (newPosition.length() > maxDistance) {
            newPosition.normalize().multiplyScalar(maxDistance)
          }

          // Tree collision
          let canMove = true
          for (const tree of treePositions) {
            const dist = Math.sqrt((newPosition.x - tree.x) ** 2 + (newPosition.z - tree.z) ** 2)
            if (dist < 15) { // Collision radius
              canMove = false
              break
            }
          }

          if (canMove) {
            drone.position.copy(newPosition)
          }
        } else {
          // Complex flight path for SIMULATOR
          let targetX, targetZ, targetY
          const radius = 40
          const pathSegment = Math.floor(time / 50) % 3

          if (pathSegment === 0) {
            targetX = Math.sin(time * 0.3) * radius * (1 - (time % 50) / 50)
            targetZ = Math.cos(time * 0.3) * radius * (1 - (time % 50) / 50)
            targetY = 15 + (time % 50) / 50 * 30
          } else if (pathSegment === 1) {
            targetX = Math.sin(time * 0.2) * radius
            targetZ = Math.cos(time * 0.2) * radius
            targetY = 45 + Math.sin(time * 0.15) * 5
          } else {
            const returnProgress = (time % 50) / 50
            targetX = Math.sin(time * 0.2) * radius * (1 - returnProgress)
            targetZ = Math.cos(time * 0.2) * radius * (1 - returnProgress)
            targetY = 45 - returnProgress * 25
          }

          drone.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05)

          const nextX = Math.sin((time + 0.05) * 0.3) * 40
          const moveX = nextX - targetX
          
          drone.rotation.z = moveX * 0.1
          drone.rotation.x = targetZ * 0.05
        }

        propellerGroupsRef.forEach((group) => {
          group.rotation.z += 0.5
        })
      }

      // update video texture if present
      if (videoTextureRef.current) {
        videoTextureRef.current.needsUpdate = true
      }

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
      if (containerRef.current && renderer.domElement.parentElement === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      if (videoRef.current && containerRef.current && videoRef.current.parentElement === containerRef.current) {
        containerRef.current.removeChild(videoRef.current)
      }
      renderer.dispose()
    }
  }, [isSimulating, dataMode])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  )
}
