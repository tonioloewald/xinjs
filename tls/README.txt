# Create your own certificates

```
openssl genrsa -out key.pem 4096
openssl req -new -sha256 -key key.pem -out csr.csr
openssl req -x509 -sha256 -days 365 -key key.pem -in csr.csr -out certificate.pem
openssl req -in csr.csr -text -noout | grep -i "Signature.*SHA256" && echo "All is well"
```

A script is provided for this:

```
cd tls
chmod +x create-dev-certs.sh
./create-dev-certs.sh
cd ..
```

[instructions adapted from here](https://msol.io/blog/tech/create-a-self-signed-ssl-certificate-with-openssl/)

