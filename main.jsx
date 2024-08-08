# Install required libraries
!pip install google-generativeai anthropic openai groq ipywidgets python-dotenv

import os
import google.generativeai as genai
from anthropic import Anthropic
import openai
from groq import Groq
from IPython.display import display, HTML
import ipywidgets as widgets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

os.environ["OPENAI_API_KEY"] = ""

# Set up API clients
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Define the story elements in Vietnamese
character_archetypes = ["Anh hùng", "Kẻ phản diện", "Kẻ lừa đảo", "Người cố vấn"]
story_settings = ["Kỳ ảo", "Khoa học viễn tưởng", "Lịch sử", "Hiện thực"]
genders = ["Nam", "Nữ", "LGBTQ+", "Không xác định"]
genres_and_styles = [
    "Hành động", "Phiêu lưu", "Hài hước", "Kịch tính", "Kinh dị", "Bí ẩn", "Lãng mạn", "Giật gân",
    "Ngôi thứ nhất", "Ngôi thứ ba", "Dạng thư tín", "Dòng ý thức",
    "Tối giản", "Dài dòng", "Thơ ca", "Châm biếm"
]

# Define available models
models = {
    "Gemini": "gemini-pro",
    "Anthropic": "claude-3-opus-20240229",
    "OpenAI": "gpt-4-turbo-preview",
    "Groq": "mixtral-8x7b-32768"
}

# Create styled widgets for user input
style = {'description_width': 'initial'}
layout = widgets.Layout(width='auto', margin='5px 0')

model_dropdown = widgets.Dropdown(options=list(models.keys()), description='Mô hình AI:', style=style, layout=layout)
archetype_dropdown = widgets.Dropdown(options=character_archetypes, description='Nhân vật:', style=style, layout=layout)
setting_dropdown = widgets.Dropdown(options=story_settings, description='Bối cảnh:', style=style, layout=layout)
location_input = widgets.Text(description='Địa điểm:', style=style, layout=layout)
gender_dropdown = widgets.Dropdown(options=genders, description='Giới tính:', style=style, layout=layout)
age_input = widgets.IntText(description='Tuổi:', min=0, max=150, style=style, layout=layout)
genres_multiselect = widgets.SelectMultiple(
    options=genres_and_styles,
    description='Thể loại & Phong cách:',
    rows=5,
    style=style,
    layout=widgets.Layout(width='auto', margin='5px 0', height='150px')
)
generate_button = widgets.Button(description="Tạo câu chuyện", button_style='primary', layout=widgets.Layout(width='50%', margin='10px 0'))
output = widgets.Output(layout=widgets.Layout(width='100%', border='1px solid #ddd', padding='10px', margin='10px 0'))

def generate_gemini_story(prompt):
    model = genai.GenerativeModel(models["Gemini"])
    response = model.generate_content(prompt)
    return response.text

def generate_anthropic_story(prompt):
    response = anthropic_client.messages.create(
        model=models["Anthropic"],
        max_tokens=2000,
        messages=[
            {"role": "system", "content": "Bạn là một người kể chuyện sáng tạo, thành thạo nhiều thể loại và phong cách viết. Hãy viết bằng tiếng Việt."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.content[0].text

def generate_openai_story(prompt):
    response = openai_client.chat.completions.create(
        model=models["OpenAI"],
        messages=[
            {"role": "system", "content": "Bạn là một người kể chuyện sáng tạo, thành thạo nhiều thể loại và phong cách viết. Hãy viết bằng tiếng Việt."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=2000
    )
    return response.choices[0].message.content

def generate_groq_story(prompt):
    response = groq_client.chat.completions.create(
        model=models["Groq"],
        messages=[
            {"role": "system", "content": "Bạn là một người kể chuyện sáng tạo, thành thạo nhiều thể loại và phong cách viết. Hãy viết bằng tiếng Việt."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=2000
    )
    return response.choices[0].message.content

# Function to generate the story
def generate_story(button):
    with output:
        output.clear_output()
        print("Đang tạo câu chuyện...")
        
        selected_genres = ', '.join(genres_multiselect.value)
        
        prompt = f"""Tạo một câu chuyện ngắn bằng tiếng Việt dựa trên các yếu tố sau:
        - Nguyên mẫu nhân vật: {archetype_dropdown.value}
        - Bối cảnh: {setting_dropdown.value}
        - Địa điểm: {location_input.value}
        - Giới tính: {gender_dropdown.value}
        - Tuổi: {age_input.value}
        - Thể loại và Phong cách: {selected_genres}

        Trước tiên, hãy tạo một gợi ý câu chuyện ngắn kết hợp các yếu tố này. Sau đó, viết một câu chuyện ngắn dựa trên gợi ý đó."""
        
        try:
            if model_dropdown.value == "Gemini":
                story = generate_gemini_story(prompt)
            elif model_dropdown.value == "Anthropic":
                story = generate_anthropic_story(prompt)
            elif model_dropdown.value == "OpenAI":
                story = generate_openai_story(prompt)
            elif model_dropdown.value == "Groq":
                story = generate_groq_story(prompt)
            else:
                raise ValueError("Invalid model selection")
            
            print(story)
        except Exception as e:
            print(f"Đã xảy ra lỗi: {str(e)}")

# Connect the button to the function
generate_button.on_click(generate_story)

# Create a container for the UI
ui_container = widgets.VBox([
    widgets.HTML("<h2 style='text-align: center;'>Trình tạo câu chuyện AI</h2>"),
    widgets.HBox([widgets.VBox([model_dropdown, archetype_dropdown, setting_dropdown]), 
                  widgets.VBox([location_input, gender_dropdown, age_input])]),
    genres_multiselect,
    generate_button,
    output
], layout=widgets.Layout(width='100%', padding='20px'))

# Display the UI
display(ui_container)

# Add some custom CSS to improve the overall look
display(HTML("""
<style>
    .widget-dropdown, .widget-text, .widget-select-multiple {
        width: 100% !important;
    }
    .widget-select-multiple {
        height: 150px !important;
    }
    .widget-button {
        width: 50% !important;
        margin: 10px auto !important;
        display: block !important;
    }
</style>
"""))
