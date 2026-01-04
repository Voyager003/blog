---
title: 'Mockito 파헤치기 with Mock, Spy'
date: 2024-10-27
tags: ["java", "spring", "test"]
category: "article"
excerpt: ""
draft: false
---

안녕하세요. Test double의 Mock, Spy에 대해 공부하다가 혼동되는 부분이 있어 개인적으로 정리해봤습니다.

예제 코드는 [Github](https://github.com/Voyager003/blog-code/tree/main/testdouble)에 있습니다.

---

## 테스트 더블 (Test double)

먼저 예제에 앞서 테스트 더블에 대해 짚고 가겠습니다. 설명은 [Xunit 패턴의 내용](http://xunitpatterns.com/Test%20Double.html)을 따릅니다.

> 테스트 환경에서 사용할 수 없는 다른 구성요소에 의존하기 때문에 테스트 대상 시스템(SUT)를 테스트하는 것은 어려울 수 있다.
> ...(중략)
> 실제 종속된 구성 요소(DOC)를 사용할 수 없거나 사용하지 않기로 선택한 테스트를 작성할 때 테스트 더블로 대체할 수 있다. 실제 DOC와 똑같이 동작할 필요없이 SUT가 종속된 구성 요소라고 생각하도록 실제 종속된 구성 요소와 동일한 API를 제공하기만 하면 된다.

<img src="https://github.com/user-attachments/assets/e522dcb1-4b52-4641-a10e-4322f51f1a2e" />

한 줄로 요약하면 프로덕션 코드에 의존하지 않고 종속성을 충족하는 객체를 만드는 소프트웨어라고 말할 수 있습니다.

테스트 더블의 종류는 다섯 가지지만 내용 이해에 필요한 부분만 짚고 가겠습니다

### Stub

> 실제 객체를 테스트 대상 시스템에 원하는 간접 입력(indirect input)을 지원하는 테스트 전용 객체로 대체한다.

Stub은 테스트 중에 호출된 것에 대한 정해진 답변을 제공하는 방법입니다.

설명보다 코드를 통해 알아봅시다.

#### Mockito에서 Stub을 다루는 법

##### Ongoing Stubbing

<img src="https://github.com/user-attachments/assets/62d25eea-ed9a-4e42-9de3-c4365c93d416" />


`Ongoing Stubbing`은 when 메서드에 stubbing 할 메서드를 명시하고 반환 값을 정의하는 메서드입니다. 이 때, 메서드 체이닝 형태로 작성합니다.

```java
when(reservatinoService.createReservation()).thenReturn(product);
```
위 코드의 경우 stubbing 할 메서드는 reservatinoService.createReservation()이 되는 것이고, stubbing 한 메서드 호출 뒤 product를 반환하도록 정의하는 코드입니다.

then의 경우, 객체 반환뿐만 아니라 예외 던지기(thenThrow), 실제 메서드 호출(thenCallRealMethod)를 던지게 할 수도 있습니다.

##### Stubber

<img src="https://github.com/user-attachments/assets/7ba556c8-abef-4567-bd18-e0ac636a2ec7" />

`Stubber`는 BaseStubber를 상속하며 when 절에 stubbing 할 클래스를 명시하고, 메서드를 호출합니다.

```java
OrderService orderService = Mockito.mock(OrderService.class);

Mockito.doReturn("DELIVERED").when(orderService).getOrderStatus(1L);

String status = orderService.getOrderStatus(1L);

assertEquals("DELIVERED", status);
```

위 코드의 경우 stub이 getOrderStatus가 1L을 입력받았을 때 "DELIVERED"를 반환하도록 정의한 것입니다.

Ongoing stubbing과 마찬가지로 예외를 던지거나, 실제 메서드를 호출하는 메서드도 지원합니다.

### Mock & Spy

#### Mock

`Mock`의 핵심은 행동을 의도한 방식으로 모방하는 것입니다.

이 때, Mock 객체의 모든 메서드는 기본적으로 아무 동작도 수행하지 않으며, 미리 정의한 stubbing에 의해서만 값을 반환합니다.

```java
// Mock 생성
BookService mockBookService = Mockito.mock(BookService.class);

// Stubbing에 의해서 값을 반환!
when(mockBookService.findBook("Java")).thenReturn(new Book("Java Programming"));
```
#### Spy
`Spy`는 실제 객체를 기반으로 생성되며, 객체의 실제 메서드를 호출합니다.

다만 필요한 메서드에 대해 stubbing하여 반환값을 지정할 수 있습니다.

```java
// BookService
public class BookService {
    public Book findBook(String title) {
        return new Book(title);
    }
}

// 실제 BookService 객체 생성
BookService realBookService = new BookService();

// Spy 객체 생성
BookService spyBookService = Mockito.spy(realBookService);

// 특정 메서드만 Stubbing
when(spyBookService.findBook("Java")).thenReturn(new Book("Mocked Book"));

// 1. Stubbing되지 않은 메서드 호출 (실제 메서드 호출)
Book bookPython = spyBookService.findBook("Python");
assertEquals("Python", bookPython.getTitle()); // 실제 title이 "Python"이어야 함

// 2. Stubbing된 메서드 호출 (Stubbing된 결과 반환)
Book bookJava = spyBookService.findBook("Java");
assertEquals("Mocked Book", bookJava.getTitle()); // title이 "Mocked Book"이어야 함
    }
}
```

이러한 특성을 이용해 객체의 **일부 동작을 테스트하면서, 나머지 메서드는 실제로 실행해야 하는 경우**에 사용할 수 있습니다.

## 예제

예제는 책 대여 시스템으로 전체적인 흐름은 다음을 따릅니다.

1. 대여자를 조회
2. 책 조회
3. 책 대여 가능여부 확인
4. 대여 정보 생성하고 저장

코드에 필요한 도메인 엔티티와 서비스 코드를 간략하게 구현한 모습은 다음과 같습니다.

<img src="https://github.com/user-attachments/assets/12fa2483-fbdf-4e1c-90a1-81db83debd99" />


서비스 코드는 다음과 같습니다.

<img src="https://github.com/user-attachments/assets/6343587e-f078-4adc-9143-320c25860dba" />

이제 Service 로직의 테스트 코드를 작성해보겠습니다.

<img src="https://github.com/user-attachments/assets/824efed4-c124-4b8f-a05b-f70c28efeaa7" />

<img src="https://github.com/user-attachments/assets/c1281a27-31a5-4c9f-a8e9-b9de868bd8be" />

테스트까지 성공했습니다.

### 문제점
테스트는 성공했지만 몇 가지 문제점이 보입니다.

살펴보면 given절에서 도메인 엔티티 생성을 위한 픽스처를 생성하고, DB에 저장하는 작업이 이어집니다. 예시에는 포함안됐지만 실제 프로덕션환경과 유사하다면 DB와 관련된 세팅도 선행될 것입니다.

createReservation의 관심사는
1. 사용자와 책 조회가 되지 않으면 예외 던지기
2. 책 대여 가능 여부를 검증
3. 예약 객체가 생성되고 저장되었는지
4. 책의 대여 여부 상태를 변경했는지
5. 예약 ID를 반환하는지

이지만 given 절에 선언된 주변 코드가 너무 많습니다. 즉, 테스트의 '관심사'가 벗어났다는 것입니다.

그렇다면 관심사에 맞는 테스트를 하기 위해서는 어떤 상황 설정이 필요할까요?

1. 사용자와 책 조회가 되지 않으면 예외 던지기 -> 존재하지 않는 memberId, bookId를 사용해 findById 호출 시 비어있는 Optional을 반환
2. 책 대여 가능 여부를 검증 -> 조회된 Book 객체의 상태를 AvailabilityStatus.RESERVED로 설정
3. 예약 객체가 생성되고 저장되었는지 -> changeAvailability(AvailabilityStatus.RESERVED)가 호출되었는지 검증

등등.. 위와 같은 상황 설정을 필요할 것입니다. 하지만 이를 미리 세팅하고, 테스트를 실행할 때마다 다시 세팅하는 것은 너무 번거롭습니다.

테스트 더블을 사용해 코드를 격리해보겠습니다.

## Mock을 사용한 경우

<img src="https://github.com/user-attachments/assets/f1d318b4-bd49-4da2-a0c3-70539ad7d337" />

<img src="https://github.com/user-attachments/assets/722d61db-f9eb-46a1-8f0b-c18cbb6163d8" />

가장 처음에 작성했던 스프링 컨텍스트를 띄운 통합테스트와 달리
1. 실제 Repository를 생성해서 의존성을 해결하지 않고 mock 객체를 생성하여 의존성을 해결했고
2. 기대 행위를 작성(when, thenReturn)하여 테스트에서 원하는 기대 상황을 만들고 (stub)
3. 검증(verify)하는 작업으로 이어집니다.

이 때, @InjectMocks 애노테이션이 Service 코드에 명시된 것을 확인할 수 있는데, 애노테이션이 명시된 필드에 대한 인스턴스를 자동으로 생성하고 @Mock, @Spy가 명시된 필드가 있는 경우, 이 필드들을 찾아서 주입하게 됩니다.
## Spy를 사용한 경우

<img src="https://github.com/user-attachments/assets/29bb7827-02c2-4db9-b9b2-15c7b8795abb" />

<img src="https://github.com/user-attachments/assets/df69a04d-34a5-4815-a911-caa33dd50f30" />

테스트에서 책을 대여한 뒤에 대여 상태를 바꾸지 않는다(book의 changeAvailablity 메서드)는 시나리오가 발생했다고 해봅시다.

위에서 살펴봤듯이 Spy가 이를 다룰 수 있습니다.

Book 객체를 spy 객체로 선언한 뒤에 changeAvailability 메서드가 호출되어도 아무런 동작도 하지 않도록 stubbing했습니다.

원래 동작대로라면 대여 상태 변경이 시도되었다면 상태가 RESERVED로 변경되어야 하지만 stubbing에서 지정한대로 동작하지 않았기 때문에 changeAvailability가 호출되었음에도 여전히 AVAILABLE임을 확인할 수 있었습니다.

이처럼 실제 객체를 기반으로 일부만 stubbing하여 테스트 환경을 예측가능하도록 만들 수 있습니다.

---

## 맺음

Mock을 사용한 테스트는 테스트가 성공했다고해서 실제 운영 환경에서도 정상적으로 기능이 동작하리라 확신할 수는 없다는 생각을 항상 가지고 있었습니다.

그래서 Mock 사용을 일부러 기피했었는데요, 하지만 이번 글을 작성하면서 효율적인 테스트는 어떻게 짤 수 있는가, 테스트 더블을 어떻게 사용하면 테스트 격리가 가능할지 고민하는 좋은 시간이 되었습니다.

테스트 방법론에 대해서는 워낙 갑론을박이 있기 때문에 좀 더 많은 상황을 마주쳐봐야 제 생각도 확립될 것 같습니다.

읽어주셔서 감사하고, 잘못된 정보를 지적해주시면 바로 반영하겠습니다.

---

## 출처

- http://xunitpatterns.com/Test%20Double.html - Xunit Testdouble
- http://xunitpatterns.com/Test%20Stub.html - Xunit stub
- https://en.wikipedia.org/wiki/Test_double - Mock, Spy 설명
