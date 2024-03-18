import numpy as np


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
    time = np.linspace(0, duration, num_steps)

    # Initialize data structure
    data = []

    # Initial angular velocity and quaternion
    angular_velocity = np.array([0.1, 0.01, 0.5])
    quaternion = np.array([1.0, 0.0, 0.0, 0.0])  # Represents no rotation initially

    for t in time:
        # Simulate changes in angular velocity (this is arbitrary for demonstration)
        angular_velocity = np.ones(3)

        # Simplified quaternion update (not physically accurate, for demonstration only)
        dq = 0.5 * np.random.normal(0, 0.1, 4)
        quaternion = np.add(quaternion, dq)
        quaternion = quaternion / np.linalg.norm(
            quaternion
        )  # Normalize to ensure it's a valid quaternion

        # Store the state
        data.append(
            {
                "time": t,
                "angular_velocity": angular_velocity.tolist(),
                "quaternion": quaternion.tolist(),
            }
        )

    return data


# Example usage
if __name__ == "__main__":
    simulation_duration = 10  # seconds
    timestep = 0.1  # seconds
    data = run_simulation(simulation_duration, timestep)
    print(data)
