#include <emscripten.h>
#include <string>

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    void printMessage(int a, int b, const char* msg) {
        printf("Number 1: %d\n", a);
        printf("Number 2: %d\n", b);
        printf("Message: %s\n", msg);
    }
}
