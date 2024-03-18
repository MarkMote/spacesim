from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

# from api.run_simulation import run_simulation

# from api.sc_dynamics import run_simulation

# from run_simulation import simulate as run_simulation
app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")


@app.get("/api/healthchecker")
def healthchecker():
    return {"status": "success", "message": "Integrate FastAPI Framework with Next.js"}


# @app.get("/api/addone/{number}")
# def addone(number: int):
#     return {"result": number + 1}


@app.get("/api/multiply/{number_1}/{number_2}")
def multiply(number_1: int, number_2: int):
    return {"result": number_1 * number_2}


# @app.get("/api/simulate")
# async def simulate():
#     # Default simulation parameters
#     duration = 10  # For example, 10 seconds
#     timestep = 0.01  # For example, 0.1 seconds timestep

#     # Call the simulation function with the default parameters
#     simulation_data = run_simulation(duration, timestep)

#     # Return the simulation data
#     return {"simulation_data": simulation_data}
