---
title: '격리된 테스트 환경 만들기'
date: 2024-11-10
tags: ["spring", "test"]
category: "article"
excerpt: ""
draft: false
---

소프트웨어를 만들 때 테스트 코드를 작성하는 것은 서비스의 안정성을 높이고 부작용을 줄일 수 있는 좋은 방법입니다.

그 중 테스트에서 '격리된 테스트 환경'을 만드는 것은 테스트에서 굉장히 중요한 개념인데, 이를 어떻게 구축할 수 있는지 한 번 정리해봤습니다.

예제 코드는 [Github 레포](https://github.com/Voyager003/isloation_testing)에 있습니다.

## 격리된 테스트(Isolation testing)란?

`격리된 테스트`라는 것은 시스템을 여러 모듈로 분해하여 쉽게 테스트하거나 평가할 수 있도록 하는 프로세스입니다.

시스템을 여러 모듈로 분해함으로써 '복잡성 및 종속성의 영향을 받지않고' 개별 기능이나 방법을 테스트하는 데 집중할 수 있게됩니다.

설명만으로는 추상적이기 때문에 하나의 상황을 상정해보겠습니다.

### 격리되지 않았을 때 생길 수 있는 문제점

<img src="https://github.com/user-attachments/assets/f9a3500e-8de4-47b1-a935-4bce8ba1c5f6" />

먼저 첫 번째 테스트(testSaveProduct)에서 상품(Product)를 등록했을 때, 예외를 던지지 않고 테스트가 성공합니다.

이어서, 두 번째 테스트(testFindProductThrowsException)가 실행되면 첫 번째 테스트에서 등록된 상품의 정보가 이미 DB에 존재하기 때문에 NoExistProductException 예외가 발생하지 않아 테스트에 실패합니다.

각 테스트가 격리되지 않았기때문에 테스트의 결과가 또 다른 테스트의 결과에 영향을 미치게된 것입니다.

반면 테스트를 하나씩 따로 실행하면 DB에 등록된 정보가 중복되지 않기 때문에 테스트는 성공합니다.

이처럼, DB와 같은 공유 자원을 사용하는 테스트에서 실행 순서와 같은 이유로 인해 **항상 같은 결과를 보장하지 않는** 테스트를 `비결정적 테스트(Non-Determinisitic Test)` 라고 합니다.

비결정적 테스트는 전염성이 있기 때문에 10개의 비결정적 테스트가 포함된 100개의 테스트 모음이 있다면 가끔씩 실패하게 되는데 결과적으로 전체적인 테스트를 망치게 됩니다.

## 그래서 어떻게 격리하는가?

테스트 격리의 핵심은 순서에 상관없이 독립적으로 실행되며 결정적으로 수행되어야 한다는 것입니다.

[마틴 파울러의 글](https://martinfowler.com/articles/nonDeterminism.html)에 따르면 격리된 테스트를 환경을 만드는 방법은 다음과 같습니다.

1. 항상 처음부터 시작 상태를 다시 빌드하거나 각 테스트가 제대로 정리(clean-up)되었는지 확인하는 것
2. DB를 사용할 때 트랜잭션 내에서 테스트를 수행한 다음 테스트가 끝나면 트랜잭션을 롤백하기

여러 프레임워크에서 이를 위한 기능을 제공하는데 하나씩 살펴보겠습니다.

### @BeforeEach, @AfterEach

`@BeforeEach`와 `@AfterEach` 애노테이션은 **Junit 프레임워크**에서 지원하는 기능으로 애노테이션을 메서드에 명시하면 각각 현재 테스트 클래스의 각 메서드 보다 먼저(Before) 혹은 나중에(After) 실행되어야 함을 나타냅니다.

<img src="https://github.com/user-attachments/assets/125d41ce-b201-431c-8fc2-4fffb1745a07" />

**BeforeEach(setUp)** 는 해당 클래스 내부의 메서드가 시작하기전에 항상 수행하는 일을 지정할 수 있는데, 테스트에 필요한 픽스처를 정의하여 테스트 수행전에 Product 2개를 생성하고 테스트하도록 시작하도록 설정한 것입니다.

**AfterEach(tearDown)** 는 테스트를 마치고 DB의 데이터로 인해 다른 테스트들이 영향받지 않도록 데이터를 소거하는 작업을 합니다.

<img src="https://github.com/user-attachments/assets/20f31f75-7d3c-45c5-848d-315d2c9cd851" />

<img src="https://github.com/user-attachments/assets/ffff1584-c405-494b-977b-728f6e307df9" />

테스트 결과를 확인해보면 각 테스트 시작 전, 후에 애노테이션을 명시한 메서드가 실행되는 것을 확인할 수 있습니다.

이렇게 수동으로 상태를 정리하는 방법은 각 테스트에서 실행되야 하는 중복되는 작업에 대해 대처할 수 있고, 코드의 길이를 줄여 가독성을 높일 수 있습니다.

이 때 주의할 점이 있는데, setUp에서 픽스처를 구성하게 된다면 해당 테스트와 픽스처가 결합되어 모든 테스트에 영향을 미칠 수 있다는 것입니다.

다시 말해 setUp을 수정해도 다른 테스트에는 영향을 주지 않아야 합니다.

때문에 여러 테스트 코드에서 실행될 수 있는 픽스처의 경우 별도의 **팩토리 메서드로 추출**하여 사용한다면 테스트 간 결합도를 낮출 수 있습니다.

### @Transactional

Spring에서는 `@Transactinoal` 애노테이션을 테스트 코드에 명시하면 **자동으로 롤백**을 수행하는 아주 편리한 기능을 제공합니다.

<img src="https://github.com/user-attachments/assets/5edbff83-76e6-4c3a-83d7-518a6001e746" />

@BeforeEach와 @AfterEach를 명시하지 않고 실행한 테스트 결과를 확인해보겠습니다.

<img src="https://github.com/user-attachments/assets/a52fa1a2-6c28-4b55-848a-b8134ad283b5" />

첫 번째 테스트는 성공했지만, 두 번째 테스트에서 첫 테스트가 롤백되지 않아 이전 테스트의 결과인 3개가 전이되어 예상했던 2개가 아닌 5개임을 확인할 수 있습니다.

하지만 테스트 메서드에 @Transactional을 명시하면 어떨까요?

<img src="https://github.com/user-attachments/assets/9cf95363-da69-406e-886f-4d637d3a2e02" />

기대했던대로 각 테스트가 수행되면 자동으로 롤백을 진행하기 때문에 테스트가 성공하게 됩니다.

이처럼 애노테이션 하나로 자동으로 롤백하는 편리한 기능을 제공하지만, 테스트 수행 중에 단 하나의 트랜잭션 경계만 사용되는 등 여러 이슈 때문에 의도치 않은 트랜잭션 적용되는 등 부작용이 있습니다.

테스트 코드에서 @Transactional을 사용했을 때 발생하는 부작용에 대해서는 이 글에서 다루기 너무 방대한 내용이어서 나중에 따로 다뤄보겠습니다.

### @DataJpaTest

`@DataJpaTest`는 JPA 컴포넌트에 초점을 맞춘 애노테이션입니다.

[spring docs](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/test/autoconfigure/orm/jpa/DataJpaTest.html)의 설명을 보면

1. @DataJpaTest 주석이 달린 테스트는 트랜잭션이며 각 테스트가 끝나면 롤백된다.
2. in-memory db를 사용합니다(명시적이거나 일반적으로 auto-configured되는 DataSource를 대체한다).
3. @AutoConfigureTestDatabase 애노테이션을 사용하여 이러한 설정을 재정의할 수 있다.
4. SQL 쿼리는 기본적으로 spring.jpa.show-sql 속성을 true로 설정하여 기록되며, 이는 showSql 속성을 사용하여 비활성화할 수 있다.
5. 전체 apllcation configuration을 로드하되 embedded db를 사용하려는 경우 이 애노테이션보다는 @AutoConfigureTestDatabase와 결합된 @SpringBootTest를 고려해야 한다.

라고 설명되어 있는데, 필요한 내용만 살펴보겠습니다.

<img src="https://github.com/user-attachments/assets/114fd932-841a-4955-a0a8-9c0a1e0c847f" />

application.yml에서 logging 레벨을 DEBUG로 설정하고 위 테스트를 실행하면

<img src="https://github.com/user-attachments/assets/b1def3fd-a01a-4998-afa4-fd07121ca117" />

실제로 각 테스트가 실행된 후에 롤백된 것을 확인할 수 있고, 테스트도 의도했던대로 롤백되어 성공하게 되는데, 이는 @DataJpaTest 애노테이션안에 @Transactional 애노테이션을 포함하고 있기 때문입니다.

빠르고 간편한 테스트, Data accesss에만 집중할 수 있는 등.. 가져다 주는 장점이 큰데, 프로덕션 테스트에서 어떻게 쓰이며 효율있게 테스트를 진행하려면 어떻게 사용할 수 있는지 궁금한 애노테이션입니다.

### @SQL

`@SQL`은 테스트 실행 전후에 SQL 스크립트를 실행할 수 있도록 지원하는 애노테이션입니다.

`*.sql` 파일에 작성한 스크립트를 통해 DB의 상태를 테스트에 적합하게 초기화하거나 정리하는데 사용할 수 있습니다.

먼저 스크립트 파일을 작성합니다.

```
// truncate.sql
TRUNCATE TABLE product;

// ddl.sql
INSERT INTO product (id, name, quantity) VALUES (1, '테스트 상품1', 10);
INSERT INTO product (id, name, quantity) VALUES (2, '테스트 상품2', 20);
```

<img src="https://github.com/user-attachments/assets/08b5c994-41ab-4b39-afbd-5ea441379277" />

이 때, 스크립트 파일의 위치는 resources 하위에 위치합니다.

<img src="https://github.com/user-attachments/assets/df93d3c3-1a0f-4c50-9152-2025ecfa7ecc" />

1. 첫 번째 스크립트(`truncate.sql`)는 일반적으로 테이블의 데이터를 모두 삭제하는 `TRUNCATE TABLE product;`와 같은 명령을 포함하여 데이터베이스를 초기 상태로 만들고,
2. 두 번째 스크립트(`ddl.sql`)에서는 테스트에 필요한 초기 데이터를 삽입하거나 필요한 스키마 변경을 설정했습니다.

<img src="https://github.com/user-attachments/assets/beec0bc9-d02a-4f8b-ade3-057487a38190" />

테스트는 성공합니다.

여기서 Junit의 @Before, AfterEach와 유사하게 `executionPhase` 속성을 통해 SQL 스크립트의 실행 시점을 유연하게 조절할 수 있습니다.

<img src="https://github.com/user-attachments/assets/a7861e56-67f3-4cb6-b84a-b32312671b9c" />

`BEFORE_TEST_METHOD`나 `AFTER_TEST_METHOD`를 설정하여 각 테스트 메서드 전후에 스크립트를 실행하여 유연한 실행 시점 제어가 가능합니다.

위에서 한 번 언급했듯이 @Transactional 애노테이션을 명시한 테스트는 여러모로 부작용이 많은데 @SQL 방식이 대안이 될수도 있겠네요.

### @DirtiesContext

`@DirtiesContext`는 애노테이션은 테스트 실행 중에 기본 Spring ApplicationContext가 Dirty(singleton bean의 상태를 변경하는 등 어떤 방식으로든 수정 또는 손상된 상황)한 상태가 되었으며 이를 닫아야(closed) 함을 나타냅니다.

같은 Application Context를 사용하는 테스트에서는 각각의 테스트마다 새로운 context를 생성하는게 아니라 기존의 context를 재활용하게 되면 앞서 진행한 테스트에서 특정 Bean의 속성값을 바꾸거나, 제거하게 되면 객체의 상태가 변했기 때문에 다음에 실행되는 테스트는 실패할 수도 있습니다.

<img src="https://github.com/user-attachments/assets/344c88a8-ce17-4de9-a614-582c0c1fa3e5" />

하지만 애노테이션을 명시하면 각 테스트가 실행될 때마다 새로운 컨텍스트가 생성되고, 모든 후속 테스트에 대해 기본 Spring 컨테이너가 다시 빌드됩니다.

이번에 공부하면서 처음 알게된 애노테이션인데 테스트의 원칙 중 하나인 Fast 즉, 빨라야하는데 테스트를 할 때마다 context를 다시 로드하여 독립성을 보장하는 방법은 과한 방법이라고 생각되네요.

특히나 프로덕션 코드가 방대해진다면 오버헤드가 더욱 커질 것을 생각하면, 다른 좋은 대안을 모색해보는게 좋을 것 같습니다.

## 맺음

테스트 코드도 프로덕션 코드만큼 굉장히 중요합니다.

특히나 DB와 관련된 테스트는 테스트를 실행할 때마다 데이터가 변경되어 일관된 결과를 보장해줄 수 없기 때문에 까다로운데요 여러 방식이 가져다주는 장점과 주의점을 숙지한다면 좋은 테스트를 작성할 수 있을 것 같습니다.

제가 미쳐 다루지 못한 방식도 많을텐데 나중에 프로젝트에 적용하면서 좋은 방법을 찾아봐야겠네요.

읽어주셔서 감사하고, 잘못된 정보를 지적해주시면 바로 반영하겠습니다.

## 출처

- https://www.professionalqa.com/isolation-testing?t - 격리된 테스트의 설명
- https://martinfowler.com/articles/nonDeterminism.html - 비결정적 테스트에 관해
- https://jojoldu.tistory.com/611 - 테스트 픽스처 올바르게 사용하기
- https://docs.spring.io/spring-boot/api/java/org/springframework/boot/test/autoconfigure/orm/jpa/DataJpaTest.html - @DataJpaTest
- https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/context/jdbc/Sql.html - @SQL
- https://docs.spring.io/spring-framework/docs/4.2.x/spring-framework-reference/html/integration-testing.html - 스프링 레퍼런스
