import control as ct
import numpy as np


def quaternion_inverse(q):
    """Calculate the inverse of a quaternion."""
    w, x, y, z = q
    # For a unit quaternion, the inverse is just its conjugate
    return np.array([w, -x, -y, -z])


def quaternion_multiply(q1, q2):
    """Multiply two quaternions."""
    w1, x1, y1, z1 = q1
    w2, x2, y2, z2 = q2
    w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2
    x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2
    y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2
    z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2
    return np.array([w, x, y, z])


def normalize_quaternion(q):
    """Normalize a quaternion to ensure it represents a valid rotation."""
    norm = np.linalg.norm(q)
    return q / norm


def dynamics(t, x, u, params):
    q = x[:4]  # Quaternion representation of orientation
    omega = x[4:]  # Angular velocity

    Q = np.array(
        [
            [0, -omega[0], -omega[1], -omega[2]],
            [omega[0], 0, omega[2], -omega[1]],
            [omega[1], -omega[2], 0, omega[0]],
            [omega[2], omega[1], -omega[0], 0],
        ]
    )

    q_dot = 0.5 * Q @ q

    control_torque = u[:3]
    J = params["J"]
    omega_dot = np.linalg.inv(J) @ (control_torque - np.cross(omega, J @ omega))

    return np.concatenate((q_dot, omega_dot))


J = np.array([[1200, 0, 0], [0, 1500, 0], [0, 0, 1000]])
params = {"J": J}
state_names = ["q[0]", "q[1]", "q[2]", "q[3]", "omega[0]", "omega[1]", "omega[2]"]
input_names = ["u[0]", "u[1]", "u[2]"]  # , 'w[0]', 'w[1]', 'w[2]']

spacecraft = ct.NonlinearIOSystem(
    dynamics,
    outfcn=None,
    params=params,
    states=state_names,
    inputs=input_names,
    outputs=state_names,
    name="spacecraft",
)


def pd_output(t, x, u, params={}):
    kp = params.get("kp", 0.0)
    kd = params.get("kd", 0.0)
    J = params["J"]

    q = u[:4]
    q_target = u[7:11]
    omega = u[4:7]

    # TODO: update to use quaternion class
    # q = Quaternion(u[:4])
    # q_target = Quaternion(u[7:11])
    # q_error = q_target*(q.inv)

    q_error = quaternion_multiply(q_target, quaternion_inverse(q))
    omega_error = -omega

    # control = kp*J@q_error[1:] + kd*J@omega_error
    control = kp * J @ q_error[1:] + kd * J @ omega_error + np.cross(omega, J @ omega)

    return control


control_pd = ct.NonlinearIOSystem(
    None,
    pd_output,
    name="controller",
    inputs=[
        "q[0]",
        "q[1]",
        "q[2]",
        "q[3]",
        "omega[0]",
        "omega[1]",
        "omega[2]",
        "q_cmd[0]",
        "q_cmd[1]",
        "q_cmd[2]",
        "q_cmd[3]",
    ],
    outputs=["y[0]", "y[1]", "y[2]"],
    params={"kp": 4, "kd": 2.5, "J": J},
)


spacecraft_system = ct.InterconnectedSystem(
    (spacecraft, control_pd),
    name="Closed Loop Spacecraft",
    connections=(  # output <- input
        # controller to spacecraft
        # ['spacecraft.u', 'controller.y'],
        ["spacecraft.u[0]", "controller.y[0]"],
        ["spacecraft.u[1]", "controller.y[1]"],
        ["spacecraft.u[2]", "controller.y[2]"],
        # feedback loop
        # ['controller', 'spacecraft'],
        # ['controller.q[0:4]', 'spacecraft.q[0:4]'],
        ["controller.q[0]", "spacecraft.q[0]"],
        ["controller.q[1]", "spacecraft.q[1]"],
        ["controller.q[2]", "spacecraft.q[2]"],
        ["controller.q[3]", "spacecraft.q[3]"],
        ["controller.omega[0]", "spacecraft.omega[0]"],
        ["controller.omega[1]", "spacecraft.omega[1]"],
        ["controller.omega[2]", "spacecraft.omega[2]"],
    ),
    inplist=[
        "controller.q_cmd[0]",
        "controller.q_cmd[1]",
        "controller.q_cmd[2]",
        "controller.q_cmd[3]",
    ],
    outlist=["controller.omega[0]"],
)


def run_simulation(duration: float, timestep: float):
    """
    Simulates spacecraft dynamics over a given duration.

    Parameters:
    - duration: Total time of simulation in seconds.
    - timestep: Time step for each update in seconds.

    Returns:
    - A list of dictionaries with each entry containing 'time', 'angular_velocity', and 'quaternion'.
    """
    num_steps = int(duration / timestep)
    t = np.linspace(0, duration, num_steps)

    # Initialize data structure

    random_vector = np.random.rand(4) - 0.5
    init_quat = random_vector / np.linalg.norm(random_vector)
    init_omega = np.array([0.1, 0.01, 0.5])
    x0 = np.concatenate((init_quat, init_omega))

    # Initial state: [q0, q1, q2, q3, omega_x, omega_y, omega_z]
    # random_vector = np.random.rand(4)
    # target_quaternion = random_vector / np.linalg.norm(random_vector)
    target_quaternion = np.array([1, 0, 0, 0])
    u = np.tile(target_quaternion, (len(t), 1)).T
    response = ct.input_output_response(spacecraft_system, t, u, x0)

    data = []
    for i in range(len(t)):
        data.append(
            {
                "time": response.time[i],
                "angular_velocity": response.x[4:, i].tolist(),
                "quaternion": response.x[:4, i].tolist(),
            }
        )

    return data


if __name__ == "__main__":
    print("Running simulation...")
    simulation_duration = 10  # seconds
    timestep = 0.1  # seconds
    data = run_simulation(simulation_duration, timestep)
    print(data)

    # plt.plot(response.t, response.x[0])
    # plt.show()


# t = np.linspace(0, 500, 5000)  # Time from 0 to 10 seconds
# x0 = np.array(
#     [1, 0, 0, 0, 0, 0, 0]
# )  # Initial state: [q0, q1, q2, q3, omega_x, omega_y, omega_z]

# random_vector = np.random.rand(4)
# target_quaternion = random_vector / np.linalg.norm(random_vector)
# u = np.tile(target_quaternion, (len(t), 1)).T
# response = ct.input_output_response(spacecraft_system, t, u, x0)

# plt.plot(response.t, response.x[0])
