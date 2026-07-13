import os
import shutil
import zipfile

def ignore_files(dir_name, contents):
    ignored = []
    for item in contents:
        if item in ['node_modules', 'venv', '.git', 'dist', '__pycache__', '.env', 'build', '.pytest_cache']:
            ignored.append(item)
    return ignored

def create_submission():
    base_dir = r"C:\Users\thispc\.gemini\antigravity\scratch\AI-RESUME-BUILDER"
    sub_folder_name = "Greeshma_Royal_AI_Resume_Builder_Submission"
    sub_dir = os.path.join(base_dir, sub_folder_name)
    
    if os.path.exists(sub_dir):
        shutil.rmtree(sub_dir)
    os.makedirs(sub_dir)
    
    # Create Demo_Video_Link.txt
    with open(os.path.join(sub_dir, "Demo_Video_Link.txt"), "w") as f:
        f.write("Demo Video attached separately.")
        
    # Copy README.md
    readme_path = os.path.join(base_dir, "README.md")
    if os.path.exists(readme_path):
        shutil.copy(readme_path, sub_dir)
        
    # Copy requirements.txt from backend
    req_path = os.path.join(base_dir, "backend", "requirements.txt")
    if os.path.exists(req_path):
        shutil.copy(req_path, sub_dir)
        
    # Copy backend folder
    backend_src = os.path.join(base_dir, "backend")
    backend_dst = os.path.join(sub_dir, "backend")
    if os.path.exists(backend_src):
        shutil.copytree(backend_src, backend_dst, ignore=ignore_files)
        
    # Copy frontend folder
    frontend_src = os.path.join(base_dir, "frontend")
    frontend_dst = os.path.join(sub_dir, "frontend")
    if os.path.exists(frontend_src):
        shutil.copytree(frontend_src, frontend_dst, ignore=ignore_files)
        
    # Copy sample_outputs folder if it exists
    sample_src = os.path.join(base_dir, "sample_outputs")
    sample_dst = os.path.join(sub_dir, "sample_outputs")
    if os.path.exists(sample_src):
        shutil.copytree(sample_src, sample_dst, ignore=ignore_files)
        
    # Create zip file
    zip_path = os.path.join(base_dir, f"{sub_folder_name}.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    print(f"Creating zip file at {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(sub_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, base_dir)
                zipf.write(file_path, arcname)
                
    # Get size
    size_bytes = os.path.getsize(zip_path)
    size_mb = size_bytes / (1024 * 1024)
    print(f"ZIP Location: {zip_path}")
    print(f"ZIP Size: {size_mb:.2f} MB")
    
    # List files
    print("\nFiles included:")
    for item in os.listdir(sub_dir):
        print(f"- {item}")
        
    print("\nSubmission package created successfully.")

if __name__ == "__main__":
    create_submission()
