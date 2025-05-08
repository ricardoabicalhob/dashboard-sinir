export interface LoginRequestI {
    login :string
    parCodigo :string
    senha :string
}

export interface LoginResponseI {
    mensagem: string,
    objetoResposta :{
        paaCodigo :number
        paaNome :string
        parCodigo :number
        parDescricao :string
        login :string
        senha :string
        cidCodigo :unknown
        estCodigo :number
        token :string
        decTipo :unknown
        paaAdmin :boolean
        isGerador :boolean | null
        isGeradorANP :boolean
        isTransportador :boolean | null
        isTransportadorANP:boolean
        isDestinador :boolean | null
        isDestinadorANP :boolean
        isArmazenadorTemporario :boolean | null
        jurCnp :string
        parTipoPessoa :string
        paaCpf :string
        anoExercicio :unknown
        anoReferencia :unknown
        dataInicioInventario :unknown
        dataLimiteEnvioInventario :unknown
        podeEnviarInventario :unknown
        isGestorTitular :boolean
        isDelegatario :boolean
        isOperadorLR :boolean
        isDestinadorLR :boolean
        parAceiteTermoUso :boolean
        senhaValida :boolean
        dataLimiteSinir :unknown
        dataHoje :unknown
        mensagemPrazoSinir :unknown
        gestorTitular :boolean
        gerador :boolean | null
        geradorANP :boolean
        transportador :boolean | null
        transportadorANP :boolean
        destinadorANP :boolean
        armazenadorTemporario :boolean | null
        delegatario :boolean
        operadorLR :boolean
        destinadorLR :boolean
        destinador :boolean | null
    },
    totalRecords :number
    erro :boolean
}