#include <emscripten.h>
#include <string>
#include <vector>
#include <sstream>
#include <iostream>

extern "C" {

// Структура для студента
struct Student {
    std::string name;
    bool pass;
    int variant;
    int mark;
};

// Данные курса
std::string course = "3";
std::string semester = "2";
std::string group = "Б-32";
std::vector<Student> students = {
    {"Иванов Иван Иванович", true, 1, 9},
    {"Петров Петр Петрович", false, 2, 5},
    {"Сидоров Сидор Сидорович", true, 3, 7}
};

// Функция для возврата данных в JSON
EMSCRIPTEN_KEEPALIVE
const char* getData() {
    std::ostringstream json;
    json << "{";
    json << "\"course\":\"" << course << "\",";
    json << "\"semester\":\"" << semester << "\",";
    json << "\"group\":\"" << group << "\",";
    json << "\"students\":[";

    for (size_t i = 0; i < students.size(); i++) {
        json << "{";
        json << "\"name\":\"" << students[i].name << "\",";
        json << "\"pass\":" << (students[i].pass ? "true" : "false") << ",";
        json << "\"variant\":" << students[i].variant << ",";
        json << "\"mark\":" << students[i].mark;
        json << "}";

        if (i < students.size() - 1) {
            json << ",";
        }
    }

    json << "]}";
    
    static std::string jsonStr = json.str();
    return jsonStr.c_str();
}

}
