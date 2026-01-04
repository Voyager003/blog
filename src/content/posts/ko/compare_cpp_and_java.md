---
title: '왜 C++은 포인터이고 Java는 참조일까?'
date: 2026-01-04
tags: ["history", "java"]
category: "article"
excerpt: ""
draft: false
---

## 개요

새해를 맞아 오랜만에 개발 역사 글을 썼습니다.

소프트웨어에서 프로그래밍 언어가 메모리를 다루는 방식은 성능과 신뢰성을 좌우합니다.

![](/img/compare_cpp_and_java/01.png)

그 중 'C/C++의 포인터'와 'Java의 참조'라는 메커니즘은 '메모리에 저장된 데이터 접근한다'는 같은 목적을 위해 존재하지만 서로 아키텍처는 다릅니다.

이 글에서는 **"직접적인 제어와 자동화된 안전성"** 사이에서 각 언어가 어떤 선택을 했는지 알아볼 것입니다.

## Java는 왜 포인터를 채택하지 않았을까

먼저 Java가 탄생했던 1990년대 초반으로 거슬러 올라가야 합니다.

당시 업계는 C와 C++가 지배하고 있었는데 Sun Microsystems에 재직 중이던 **제임스 고슬링(James Gosling)** 과 그의 팀은 프로그램 오류와 불안정성의 가장 큰 근원은 **'포인터를 통한 메모리의 직접 조작'** 으로 보았습니다.

Sun Microsystems 공식 백서에서 Java의 설계 철학을 엿볼 수 있습니다.

> "The memory management model—no pointers or pointer arithmetic—eliminates entire classes of programming errors that bedevil C and C++ programmers."

> Most studies agree that pointers are one of the primary features that enable
programmers to inject bugs into their code. Given that structures are gone, and
arrays and strings are objects, the need for pointers to these constructs goes
away. Thus, Java has no pointers. Any task that would require arrays,
structures, and pointers in C can be more easily and reliably performed by
declaring objects and arrays of objects. Instead of complex pointer
manipulation on array pointers, you access arrays by their arithmetic indices.
The Java run-time system checks all array indexing to ensure indices are within
the bounds of the array.

대부분의 연구는 포인터가 프로그래머가 코드에 버그를 주입할 수 있게 하는 주요 기능 중 하나라는 데 동의한다. 구조체가 사라지고 배열과 문자열이 객체가 되었으므로, 이러한 구조체에 대한 포인터의 필요성은 사라졌다. 따라서 Java에는 포인터가 없다.

### C/C++의 문제점은?

C/C++에서 포인터를 잘못 사용하면 발생하는 문제점은 다음과 같습니다.

#### 메모리 손상

```cpp
#include <iostream>
#include <cstring>

int main() {
    char buffer[10];
    const char* longString = "This string is way too long for the buffer!"; // 44byte

    // 안전한 대안
    strncpy(buffer, longString, sizeof(buffer) - 1);
    buffer[sizeof(buffer) - 1] = '\0';

    std::cout << "안전하게 복사됨: " << buffer << std::endl;
    return 0;
}
```

코드에서는 longString을 10바이트가 할당한 버퍼에 복사(strncpy) 시도를 시도합니다.

이렇게 되면 실제 메모리에서는 44바이트를 덮어써서(34바이트 초과) buffer 뒤에 있는 리턴 주소, 다른 지역 변수, 스택 프레임 정보 등이 덮어씌워지는 상황이 발생합니다.

운이 좋으면 즉시 크래시가 발생하는 것이고, 나쁘면 조용히 데이터 손상이 나중에 발견되어 문제점을 일으키게 됩니다.

#### 댕글링 포인터

`댕글링 포인터`는 적절한 타입의 유효한 객체를 가리키고 있지 않는 포인터를 말합니다.

댕글링 포인터의 문제점은 객체 파괴 시에 발생하는데, '객체에 대한 참조가 포인터 값에 대한 수정 없이 삭제되거나 할당 해제돼서 포인터가 계속 할당 해제된 메모리를 가리킬 때'입니다.

시스템은 할당 해제된 메모리를 다른 프로세스에게 재할당하겠지만, 기존 프로그램이 댕글링 포인터를 역참조하면 메모리는 현재 전혀 다른 데이터를 갖고 있을 것이므로 예측할 수 없는 행동이 발생하게됩니다.

```cpp
#include <iostream>

int* createDanglingPointer() {
    int localVar = 42;
    return &localVar;
}

int main() {
    int* ptr = createDanglingPointer();
    // ptr = 댕글링 포인터

    Use-After-Free
    int* p = new int(100);
    delete p;       // 메모리 해제
    // *p = 200;    // 이미 해제된 메모리 접근

    std::cout << "댕글링 포인터 예시 (실제 역참조는 위험)" << std::endl;
    return 0;
}
```

먼저 `int localVar = 42;`을 스택 메모리에 생성하고 `return &localVar;`가 지역 변수의 주소를 반환한 뒤에 함수가 종료되면서 localVar은 사라집니다.

하지만 뒤에 `int* ptr`은 이미 종료된 함수의 메모리를 가리키고 있어 주인없는 땅(?)을 가리키고 있게 됩니다.

#### 메모리 누수

Java에서도 메모리 누수가 없는 것은 아니지만 C/C++에서도 마주하는 문제 중 하나입니다.

```cpp
#include <iostream>

void memoryLeakExample() {
    for (int i = 0; i < 1000; i++) {
        int* leaked = new int[1000];  // 할당
        // delete[] leaked;  // 해제하지 않음
    }
    // 1000 * 1000 * sizeof(int) 바이트가 누수됨
}
```

새 메모리를 할당하고 주소를 leaked에 저장합니다.

다음은 반복해서 leaked가 새 주소로 덮어씌워지고, 이전 주소는 영원히 분실됩니다.

#### Java의 해결책

Java는 이 세 가지 문제를 **메모리를 직접 조작하는 메커니즘을 제거**하는 형식으로 다룹니다.

```java
public class JavaMemorySafety {
    public static void main(String[] args) {
        // 1. 버퍼 오버플로우? → 배열 경계 검사로 원천 차단
        int[] arr = new int[10];
        try {
            arr[100] = 42;  // ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("경계 초과 차단됨");
        }

        // GC 자동 처리
        for (int i = 0; i < 1000; i++) {
            int[] temp = new int[1000];
            // 루프 끝나면 참조 사라짐 → GC가 알아서 정리
        }

        System.out.println("Java: 세 가지 재앙으로부터 자유");
    }
}
```

첫 문제점인 '버퍼 오버플로우'의 경우는 런타임에 배열 경계 검사를 수행하여 예외를 던질 수 있습니다.

무엇보다 Java의 차별점은 Managed 언어라는 것이죠. 직접 메모리 해제를 하지 않고도 가비지 컬렉터가 참조없는 객체를 제거하고, 메모리 누수의 경우도 가비지 컬렉터가 알아서 정리합니다.

### Null을 처리하는 방식

두 언어 모두 "아무것도 가리키지 않는다"는 의미로 널(null) 상태를 허용하는데, 다루는 방식이 다릅니다.

```cpp
#include <iostream>

int main() {
    int* ptr = nullptr;

    // 사용 전에 검사를..
    if (ptr != nullptr) {
        *ptr = 10;
    } else {
        std::cout << "포인터가 유효하지 않습니다." << std::endl;
    }

    return 0;
}
```

C++에서 null pointer를 역참조하면 **정의되지 않은 동작(Undefined Behavior)** 이 발생합니다.

이것도 역시 운이 좋으면 즉시 크래시가 날 것이고 아니라면.. 나중에 전혀 다른 곳에서 버그가 터질 것 입니다.

반면 Java는 예외로 제어권을 유지합니다.

```java
public class NullExample {
    public static void main(String[] args) {
        String str = null;

        // null 참조 접근 시 NullPointerException 발생
        try {
            int length = str.length();  // exception 발생
        } catch (NullPointerException e) {
            System.out.println("널 참조 감지: " + e.getMessage());
            // 복구 로직 실행 가능
        }
        System.out.println("프로그램은 계속 실행");
    }
}
```

Java는 null 참조 접근 시 `NullPointerException`을 던집니다. 이는 표준 런타임 예외이기 때문에 `try-catch`로 잡아서 애플리케이션을 완전히 종료시키지 않고 복구할 수 있습니다.

---

### 메모리 접근

```cpp
#include <iostream>

int main() {
    int value = 42;
    int* ptr = &value;  // 변수의 실제 메모리 주소 획득

    std::cout << "값: " << value << std::endl;
    std::cout << "주소: " << ptr << std::endl;      // 실제 주소 출력 (예: 0x7ffd5e8a3b2c)
    std::cout << "역참조: " << *ptr << std::endl;   // 주소를 통해 값 접근

    // 주소를 직접 조작 가능
    *ptr = 100;  // value도 100으로 변경됨

    return 0;
}
```

C++의 포인터는 변수의 **실제 메모리 주소**를 저장하고 노출합니다.

OS와 같은 저수준 작업에는 이런 제어가 필요하지만, 동시에 안전성과 보안에 직접적인 영향을 미치는 큰 위험도 함께 가져옵니다.

```java
public class ReferenceExample {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("Hello");

        System.out.println(sb);              // 내용 출력
        System.out.println(sb.hashCode());   // 식별자 (주소 아님)
    }
}
```

Java의 참조는 JVM이 관리하는 **추상화된 핸들**입니다. 쉽게 말해 Java는 포인터를 없앴다기 보다는, 포인터를 직접 못 만지게 한 것이라고 보면 됩니다.

JVM 내부에서는 실제 포인터로 메모리 주소를 가리키지만, Java 코드에는 메모리 주소 대신 “주소를 가리키는 인덱스”, 즉 일종의 간접 식별자를 던져줍니다. 가상 메모리의 역할과 비슷하다고 볼 수 있겠죠?

### 포인터 연산

```cpp
#include <iostream>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int* ptr = arr;  // 배열의 첫 번째 요소를 가리킴

    std::cout << "포인터 산술로 배열 순회:" << std::endl;

    for (int i = 0; i < 5; i++) {
        std::cout << "ptr + " << i << " = " << *(ptr + i) << std::endl;
    }

    // 위험한 예: 범위를 벗어난 접근
    // std::cout << *(ptr + 100);  // 정의되지 않은 동작!

    ptr++;  // 다음 요소로 이동
    std::cout << "ptr++ 후: " << *ptr << std::endl;  // 20

    return 0;
}
```

C++는 포인터에 대한 산술 연산을 허용합니다. 이 역시 저수준 시스템 제어에 강력하지만, 잘못 사용하면 안전하지 않은 기능입니다.

```java
public class ArrayExample {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};

        // 인덱스로만 접근 가능
        for (int i = 0; i < arr.length; i++) {
            System.out.println("arr[" + i + "] = " + arr[i]);
        }
        // 범위 벗어나면 예외 발생
        try {
            int value = arr[100];  // ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("배열 범위 초과!");
        }
    }
}
```

위에서도 설명했지만 Java는 보안과 안정성을 위해 포인터 연산을 **원천 봉쇄**합니다. 오직 인덱스로만 접근할 수 있습니다.

## 맺음

언어의 기원과 설계 철학을 보면 '언어의 우위'를 가리는 일은 정말 무의미한 일이라는 것을 다시 한 번 느낍니다. 어딜가나 좋은 면이 있으면 버리는 게 있는 트레이드오프가 존재하니까요.

그저 0과 1로 만들어진 논리 게이트에 의미를 부여하여 추상화 수준을 올려 프로그래밍 언어로 만든 고대 개발자(?)들이 존경스럽습니다.

## 출처

- [댕글링 포인터](https://ko.wikipedia.org/wiki/%ED%97%88%EC%83%81_%ED%8F%AC%EC%9D%B8%ED%84%B0)
- [2024 Java summit](https://youtu.be/zg8xM0xxFa8?si=Y32W2TZzqr1pIF_h)
- [Sun Microsystems Java whitepaper](https://www.stroustrup.com/1995_Java_whitepaper.pdf)
- [Java Creator James Gosling Interview](https://evrone.com/blog/james-gosling-interview)
