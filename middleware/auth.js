const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

const Bibliotecario = (req, res, next) => {
    if (req.user.perfil !== 'bibliotecario') {
        return res.status(403).json({ error: 'Acesso negado. Apenas bibliotecários.' });
    }
    next();
};

const Leitor = (req, res, next) => {
    if (req.user.perfil !== 'leitor') {
        return res.status(403).json({ error: 'Acesso negado. Apenas leitores.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    Bibliotecario,
    Leitor
};