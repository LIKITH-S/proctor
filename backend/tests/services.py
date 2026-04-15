import subprocess
import sys
import os
import tempfile

def execute_code(source_code, input_data=""):
    """
    Executes Python code locally on the server for development purposes.
    Warning: This is for development only as it runs code on the host machine.
    """
    # Create a temporary file for the script
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as tmp_file:
        full_code = source_code + "\n\nif __name__ == '__main__':\n    try:\n        solution()\n    except NameError:\n        pass\n"
        tmp_file.write(full_code.encode())
        tmp_path = tmp_file.name

    try:
        # Run the script using the current python interpreter
        result = subprocess.run(
            [sys.executable, tmp_path],
            input=input_data.encode(),
            capture_output=True,
            timeout=5, # 5 second limit
            text=False
        )
        
        stdout = result.stdout.decode(errors='replace')
        stderr = result.stderr.decode(errors='replace')
        
        status = "Accepted"
        if result.returncode != 0:
            status = "Runtime Error"
            
        return {
            "stdout": stdout,
            "stderr": stderr,
            "compile_output": "",
            "status": status,
            "time": 0.1, # Dummy time
            "memory": 0,
        }
    except subprocess.TimeoutExpired:
        return {"status": "Time Limit Exceeded", "stderr": "Execution timed out after 5 seconds."}
    except Exception as e:
        return {"error": str(e), "status": "Request Failed"}
    finally:
        # Clean up the temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
