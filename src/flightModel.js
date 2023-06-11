import * as THREE from 'three'

// direction vectors
const UP = new THREE.Vector3(0,1,0)
const RIGHT = new THREE.Vector3(1,0,0)
const FORWARD = new THREE.Vector3(0,0,1)

// world parameters
const GRAVITY = 9.81

// plane parameters
const MASS = 100
const MAX_THRUST = 200
const MAX_SPEED = 300
const DRAG_COEFFICIENT = 5.0

// movement control
const YAW_RATE = Math.PI / 12

// forces
const thrust = new THREE.Vector3()
const drag = new THREE.Vector3()
const lift = new THREE.Vector3()
const weight = new THREE.Vector3()
const forces = new THREE.Vector3()

// momentum
const accel = new THREE.Vector3()
const velocity = new THREE.Vector3()

export function flightModel (plane, controls, delta) {
    
    // plane direction vectors
    const up = UP.clone().applyQuaternion(plane.quaternion)
    const right = RIGHT.clone().applyQuaternion(plane.quaternion)
    const forward = FORWARD.clone().applyQuaternion(plane.quaternion)
    const prjForward = forward.clone().setY(0)
    const velocityDirection = velocity.clone().normalize()


    const aoa = Math.atan2( velocity.y, velocity.z )

    if ( controls.PITCH_UP ) {
        plane.rotateX(-Math.PI / 6 * delta)
    }
    if ( controls.PITCH_DOWN ) {
        plane.rotateX(Math.PI / 6 * delta)
    }
    if ( controls.ROLL_LEFT ) {
        plane.rotateZ(-Math.PI / 4 * delta)
    }
    if ( controls.ROLL_RIGHT ) {
        plane.rotateZ(Math.PI / 4 * delta)
    }

    // auto yaw
    const prjUp = up.clone().projectOnPlane(prjForward).setY(0)
    const sign = (prjForward.x * prjUp.z - prjForward.z * prjUp.x) > 0 ? -1 : 1
    plane.rotateOnWorldAxis(UP, sign * prjUp.length() * prjUp.length() * prjForward.length() * 2.0 * YAW_RATE * delta)

    // plane speed
    const speed = velocity.clone().length()

    // thrust (F = ma)
    thrust.copy(forward).multiplyScalar( MAX_THRUST * MASS )

    // drag (D = K * v^2; where K is come tuned constant)
    // TODO: drag dependent on air density + maybe some roll drag
    drag.copy(velocityDirection).negate().multiplyScalar( DRAG_COEFFICIENT * speed * speed )

    // weight ( F = mg )
    weight.copy(UP).negate().multiplyScalar( MASS * GRAVITY * 1.0)

    // lift ( L = K * v^2 )
    const liftVelocity = velocityDirection.clone().projectOnPlane(right)
    const liftCoefficient = Math.sin(aoa)
    const liftMagnitude = speed * speed * liftCoefficient * 0.3
    lift.copy(up).multiplyScalar( liftMagnitude )
    
    // total up forces
    forces.set(0,0,0).add(thrust).add(drag).add(weight).add(lift)

    // apply acceleration and velocity
    accel.copy(forces).divideScalar(MASS)
    velocity.addScaledVector(accel, delta)

    // update plane's position
    plane.position.addScaledVector(velocity, delta)

    // debug
    // console.log(velocity, speed)
    console.log(lift)
}

