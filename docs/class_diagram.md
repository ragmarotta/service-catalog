```mermaid
classDiagram
    class BaseModel {
        +dict()
        +json()
    }

    class Tag {
        +str key
        +str value
    }

    class Event {
        +str event_type
        +datetime timestamp
        +Optional~str~ message
    }

    class ResourceBase {
        +str name
        +Optional~str~ description
        +List~Tag~ tags
        +List~str~ related_resources
    }

    class ResourceInDB {
        +PyObjectId id
        +List~Event~ events
    }

    class UserBase {
        +str username
        +EmailStr email
        +Optional~str~ full_name
        +str role
    }

    class UserCreate {
        +str password
    }

    class UserInDB {
        +PyObjectId id
        +str hashed_password
        +bool disabled
    }

    class Token {
        +str access_token
        +str token_type
    }

    class TokenData {
        +Optional~str~ username
    }

    class AppConfig {
        +Optional~str~ icon_url
        +bool oauth2_enabled
        +Optional~str~ oauth2_provider_url
        +Optional~str~ oauth2_client_id
        +Optional~str~ oauth2_client_secret
        +Optional~str~ oauth2_scope
        +Optional~str~ oauth2_redirect_uri
        +Optional~str~ oauth2_userinfo_url
        +Optional~str~ oauth2_username_attribute
        +Optional~str~ oauth2_email_attribute
        +Optional~str~ oauth2_login_button_text
    }

    class BulkDeleteRequest {
        +List~str~ ids
    }

    class ResourceOut {
        +ObjectIdStr id
        +str name
        +Optional~str~ description
        +List~Tag~ tags
        +List~str~ related_resources
        +List~Event~ events
    }

    class ResourceWithRelationsOut {
        +List~str~ parents
        +List~str~ children
    }

    class ResourceCreate {
        +str name
        +Optional~str~ description
        +List~Tag~ tags
        +List~str~ related_resources
    }

    class ResourceUpdate {
        +Optional~str~ name
        +Optional~str~ description
        +Optional~List~Tag~~ tags
        +Optional~List~str~~ related_resources
    }

    class EventCreate {
        +str event_type
        +Optional~str~ message
    }

    class Node {
        +str id
        +str type
        +dict data
        +dict position
    }

    class Edge {
        +str id
        +str source
        +str target
        +bool animated
        +dict style
    }

    class ServiceMap {
        +List~Node~ nodes
        +List~Edge~ edges
    }

    class UserOut {
        +ObjectIdStr id
        +str username
        +EmailStr email
        +Optional~str~ full_name
        +str role
        +bool disabled
    }

    class UserUpdate {
        +Optional~EmailStr~ email
        +Optional~str~ full_name
        +Optional~str~ role
        +Optional~bool~ disabled
        +Optional~str~ password
    }

    class ResourceImport {
        +str name
        +Optional~str~ description
        +List~Tag~ tags
        +List~str~ related_resources
    }

    class AppConfigOut {
    }

    ResourceBase <|-- ResourceInDB
    ResourceBase <|-- ResourceCreate
    ResourceBase <|-- ResourceUpdate
    ResourceBase <|-- ResourceImport

    ResourceOut <|-- ResourceWithRelationsOut

    UserBase <|-- UserCreate
    UserBase <|-- UserInDB
    UserBase <|-- UserOut
    UserBase <|-- UserUpdate

    AppConfig <|-- AppConfigOut

    ServiceMap o-- Node
    ServiceMap o-- Edge

    ResourceInDB o-- Event
    ResourceInDB o-- Tag

    ResourceOut o-- Event
    ResourceOut o-- Tag

    ResourceCreate o-- Tag
    ResourceUpdate o-- Tag
    ResourceImport o-- Tag

    UserInDB o-- Token
    UserInDB o-- TokenData

    TokenData o-- Token

    Node o-- Tag

```

### Explicação do Diagrama:

Este diagrama de classes ilustra as relações entre os principais modelos de dados e schemas utilizados na aplicação, definidos principalmente usando Pydantic. Ele destaca:

*   **Herança:** Indicada por `ClasseA <|-- ClasseB`, significando que ClasseB herda de ClasseA. Por exemplo, `ResourceInDB` herda de `ResourceBase`.
*   **Composição/Agregação:** Indicada por `ClasseA o-- ClasseB`, significando que ClasseA contém ou usa instâncias de ClasseB. Por exemplo, `ResourceInDB` contém objetos `Event` e `Tag`.
*   **Atributos Chave:** Cada classe lista seus atributos primários e seus tipos.

Este diagrama fornece uma visão geral de alto nível da estrutura de dados e como diferentes partes dos dados da aplicação são organizadas e relacionadas.