FROM stalwartlabs/mail-server:v0.11
COPY config/ /opt/stalwart/etc/
USER root
RUN chown -R 1000:1000 /opt/stalwart/etc || true
# Fallback to 777 just in case the user ID is different
RUN chmod -R 777 /opt/stalwart/etc
